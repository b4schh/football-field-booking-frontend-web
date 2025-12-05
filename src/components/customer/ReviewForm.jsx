import { useState, useEffect } from 'react';
import { FiStar, FiX, FiUpload, FiLoader } from 'react-icons/fi';
import { createReview, updateReview, getReviewByBookingId } from '../../services/reviewService';
import { compressImageToWebP, formatFileSize } from '../../utils/imageCompressor';

const ReviewForm = ({ booking, existingReview, onClose, onSuccess }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(existingReview?.images || []);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(!existingReview); // Check if not in edit mode

  const isEditMode = !!existingReview;

  // Double-check if review already exists when opening form in create mode
  useEffect(() => {
    const verifyNoExistingReview = async () => {
      if (!isEditMode) {
        try {
          const review = await getReviewByBookingId(booking.id);
          if (review) {
            setError('Bạn đã đánh giá booking này rồi. Đang tải lại...');
            setTimeout(() => {
              onSuccess?.();
              onClose();
            }, 1500);
          }
        } catch (err) {
          console.error('Error checking existing review:', err);
        } finally {
          setChecking(false);
        }
      }
    };

    verifyNoExistingReview();
  }, [booking.id, isEditMode, onClose, onSuccess]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      setError('Tối đa 5 ảnh');
      return;
    }

    setCompressing(true);
    setError('');

    try {
      // Compress images to WebP
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const originalSize = file.size;
          const compressed = await compressImageToWebP(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
          });
          
          console.log(
            `Compressed ${file.name}: ${formatFileSize(originalSize)} → ${formatFileSize(compressed.size)} (${Math.round((1 - compressed.size / originalSize) * 100)}% smaller)`
          );
          
          return compressed;
        })
      );

      setImages((prev) => [...prev, ...compressedFiles]);

      // Create previews from compressed files
      compressedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      setError('Có lỗi khi nén ảnh. Vui lòng thử lại.');
      console.error('Image compression error:', err);
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Nội dung đánh giá phải có ít nhất 10 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        // Edit mode: Only update rating and comment (no image update support yet)
        await updateReview(existingReview.id, {
          rating,
          comment,
        });
      } else {
        // Create mode: Send FormData with images
        const formData = new FormData();
        formData.append('FieldId', booking.fieldId);
        formData.append('BookingId', booking.id);
        formData.append('Rating', rating);
        formData.append('Comment', comment);

        images.forEach((image) => {
          formData.append('Images', image);
        });

        await createReview(formData);
      }
      
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gửi đánh giá';
      
      // Handle duplicate review error specifically
      if (errorMessage.includes('đã đánh giá')) {
        setError('Bạn đã đánh giá booking này rồi. Vui lòng tải lại trang.');
        // Notify parent to refresh
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {checking ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <FiLoader className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-gray-600">Đang kiểm tra...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Sân: <span className="font-semibold text-gray-900">{booking.fieldName}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Cơ sở: <span className="font-semibold text-gray-900">{booking.complexName}</span>
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Đánh giá của bạn <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <FiStar
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-semibold text-gray-700">
                  {rating === 5 && 'Tuyệt vời'}
                  {rating === 4 && 'Tốt'}
                  {rating === 3 && 'Bình thường'}
                  {rating === 2 && 'Tệ'}
                  {rating === 1 && 'Rất tệ'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nội dung đánh giá <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sân bóng này..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length} / Tối thiểu 10 ký tự
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hình ảnh (Tùy chọn)
            </label>

            {isEditMode && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-3">
                ℹ️ Chế độ chỉnh sửa chỉ cho phép cập nhật đánh giá và bình luận. Ảnh đã tải lên không thể thay đổi.
              </div>
            )}
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    {!isEditMode && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {!isEditMode && images.length < 5 && (
              <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors ${compressing ? 'opacity-50 cursor-wait' : ''}`}>
                {compressing ? (
                  <>
                    <FiLoader className="text-blue-500 animate-spin" />
                    <span className="text-sm text-gray-600">Đang nén ảnh...</span>
                  </>
                ) : (
                  <>
                    <FiUpload className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Tải ảnh lên ({images.length}/5)
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={compressing}
                  className="hidden"
                />
              </label>
            )}

            {images.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                💡 Ảnh đã được tự động nén sang định dạng WebP để tối ưu dung lượng
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || compressing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isEditMode ? 'Đang cập nhật...' : 'Đang gửi...') 
                : compressing 
                ? 'Đang nén ảnh...' 
                : (isEditMode ? 'Cập nhật đánh giá' : 'Gửi đánh giá')
              }
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default ReviewForm;
