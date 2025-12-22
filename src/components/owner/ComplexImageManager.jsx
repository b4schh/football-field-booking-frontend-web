import { useState, useEffect, useRef } from "react";
import { MdEdit, MdDelete, MdAdd, MdClose, MdCheckCircle, MdImage, MdStar, MdStarBorder, MdArrowBack } from "react-icons/md";
import complexImageService from "../../services/complexImageService";
import { useToast } from "../../store/toastStore";
import { compressImageToWebP } from "../../utils/imageCompressor";
import { validateImageFile, createImagePreview, revokeImagePreview } from "../../utils/imageHelper";

/**
 * Component quản lý ảnh của Complex
 * - Hiển thị danh sách ảnh
 * - Upload ảnh mới (tự động nén sang WebP)
 * - Xóa ảnh
 * - Chọn ảnh chính (main image)
 */
export default function ComplexImageManager({ complexId }) {
  const toast = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0); // Index của main image trong preview
  const previewUrlsRef = useRef([]); // Track preview URLs để cleanup

  useEffect(() => {
    loadImages();
  }, [complexId]);

  useEffect(() => {
    // Update ref mỗi khi previewUrls thay đổi
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    // Cleanup tất cả preview URLs khi component unmount
    return () => {
      previewUrlsRef.current.forEach(url => revokeImagePreview(url));
    };
  }, []); // Chỉ chạy khi unmount

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await complexImageService.getComplexImages(complexId);
      setImages(response.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách ảnh");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate tất cả files
    const validFiles = [];
    for (const file of files) {
      const validation = validateImageFile(file, 10);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Tạo previews cho tất cả files hợp lệ và THÊM vào danh sách hiện tại
    const newPreviews = validFiles.map(file => createImagePreview(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Reset input để có thể chọn lại cùng 1 file
    event.target.value = '';
  };

  const removePreviewImage = (index) => {
    // Revoke URL của ảnh bị xóa
    revokeImagePreview(previewUrls[index]);
    
    // Xóa khỏi arrays
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Cập nhật mainImageIndex nếu cần
    if (index === mainImageIndex) {
      setMainImageIndex(0); // Reset về ảnh đầu tiên
    } else if (index < mainImageIndex) {
      setMainImageIndex(prev => prev - 1); // Giảm index nếu xóa ảnh trước main
    }
  };

  const setAsMainImage = (index) => {
    setMainImageIndex(index);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      toast.info(`Đang nén ${selectedFiles.length} ảnh...`);
      
      // Sắp xếp lại files để main image lên đầu
      const reorderedFiles = [
        selectedFiles[mainImageIndex],
        ...selectedFiles.filter((_, i) => i !== mainImageIndex)
      ];
      
      // Nén tất cả ảnh sang WebP
      const compressPromises = reorderedFiles.map(file => 
        compressImageToWebP(file, { quality: 0.85, maxWidth: 1920 })
      );
      const compressedFiles = await Promise.all(compressPromises);
      
      console.log('Compressed files:', compressedFiles); // Debug log
      
      toast.info(`Đang upload ${compressedFiles.length} ảnh...`);
      
      // Upload tất cả ảnh
      const formData = new FormData();
      compressedFiles.forEach((file, index) => {
        console.log(`Appending file ${index}:`, file); // Debug log
        formData.append('files', file, file.name || `image-${index}.webp`);
      });

      console.log('FormData entries:', Array.from(formData.entries())); // Debug log
      
      await complexImageService.uploadImage(complexId, formData);
      
      toast.success(`Upload ${compressedFiles.length} ảnh thành công`);
      
      // Reset và reload
      setSelectedFiles([]);
      previewUrls.forEach(url => revokeImagePreview(url));
      setPreviewUrls([]);
      setMainImageIndex(0);
      await loadImages();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;

    try {
      await complexImageService.deleteImage(imageId);
      toast.success("Xóa ảnh thành công");
      await loadImages();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa ảnh thất bại");
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await complexImageService.setMainImage(imageId);
      toast.success("Đã đặt làm ảnh chính");
      await loadImages();
      // Reload trang để cập nhật ảnh chính ở header
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể đặt ảnh chính");
    }
  };

  const cancelUpload = () => {
    setSelectedFiles([]);
    previewUrls.forEach(url => revokeImagePreview(url));
    setPreviewUrls([]);
    setMainImageIndex(0);
  };

  const toggleEditMode = () => {
    // Nếu đang có preview images, hỏi confirm trước khi thoát
    if (editMode && previewUrls.length > 0) {
      if (!window.confirm("Bạn có chắc muốn hủy các ảnh đang chuẩn bị upload?")) {
        return;
      }
      cancelUpload();
    }
    setEditMode(!editMode);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MdImage className="text-2xl text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">Thư viện ảnh</h2>
          <span className="text-sm text-gray-500">({images.length} ảnh)</span>
        </div>
        <button
          onClick={toggleEditMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            editMode
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-slate-600 text-white hover:bg-slate-700"
          }`}
        >
          {editMode ? (
            <>
              <MdArrowBack className="text-lg" />
              Quay lại
            </>
          ) : (
            <>
              <MdEdit className="text-lg" />
              Chỉnh sửa
            </>
          )}
        </button>
      </div>

      {/* Upload Section - Chỉ hiện khi ở edit mode */}
      {editMode && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <div className="flex flex-col items-center gap-4">
            {previewUrls.length > 0 ? (
              <div className="w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border-2 border-gray-300"
                      />
                      
                      {/* Main Image Badge */}
                      {index === mainImageIndex && (
                        <div className="absolute top-1 left-1 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                          <MdStar className="text-sm" />
                          Main
                        </div>
                      )}
                      
                      {/* Action Buttons - Hiện khi hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {index !== mainImageIndex && (
                          <button
                            onClick={() => setAsMainImage(index)}
                            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            title="Đặt làm ảnh chính"
                          >
                            <MdStarBorder className="text-xl" />
                          </button>
                        )}
                        <button
                          onClick={() => removePreviewImage(index)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="Xóa ảnh"
                        >
                          <MdDelete className="text-xl" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Ô Thêm ảnh - nằm cuối grid */}
                  <label className="cursor-pointer aspect-square border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center hover:border-slate-500 hover:bg-slate-50 transition-all group">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                      multiple
                    />
                    <MdAdd className="text-5xl text-gray-400 group-hover:text-slate-500 transition-colors" />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer text-center block">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                  multiple
                />
                <MdAdd className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Chọn nhiều ảnh để upload</p>
                <p className="text-xs text-gray-500">Ảnh sẽ tự động nén sang định dạng WebP</p>
                <p className="text-xs text-yellow-600 font-medium mt-1">Click vào ⭐ để chọn ảnh chính</p>
              </label>
            )}
            
            {selectedFiles.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={cancelUpload}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Hủy tất cả
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 flex-1"
                >
                  {uploading ? `Đang upload ${selectedFiles.length} ảnh...` : `Upload ${selectedFiles.length} ảnh`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MdImage className="text-6xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có ảnh nào</p>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-3 text-slate-600 hover:text-slate-800 font-medium text-sm"
            >
              Bắt đầu thêm ảnh
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-slate-400 transition-all"
            >
              <img
                src={image.imageUrl}
                alt={`Complex image ${image.id}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400?text=Image+Not+Found";
                }}
              />
              
              {/* Main Image Badge */}
              {image.isMain && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                  <MdStar />
                  Ảnh chính
                </div>
              )}

              {/* Edit Mode Overlay */}
              {editMode && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!image.isMain && (
                    <button
                      onClick={() => handleSetMainImage(image.id)}
                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      title="Đặt làm ảnh chính"
                    >
                      <MdStarBorder className="text-xl" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Xóa ảnh"
                  >
                    <MdDelete className="text-xl" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Text */}
      {editMode && images.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> Hover vào ảnh để hiện nút thao tác. Chỉ có thể có 1 ảnh chính.
          </p>
        </div>
      )}
    </div>
  );
}
