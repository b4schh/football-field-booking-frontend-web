import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdCheckCircle,
  MdCancel,
  MdVisibility,
} from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import ComplexStatusBadge from "../../../components/owner/ComplexStatusBadge";
import ToggleSwitch from "../../../components/owner/ToggleSwitch";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import Modal from "../../../components/dashboard/Modal";
import complexService from "../../../services/complexService";
import fieldService from "../../../services/fieldService";
import { useToast } from "../../../store/toastStore";
import { formatTimeSpan } from "../../../utils/formatHelpers";
import { getComplexImageUrl, getImageUrl } from "../../../utils/imageHelper";

/**
 * Admin Complex Detail Page - View Only
 * Hiển thị chi tiết Complex + danh sách Field (Read-only với approval actions)
 */
export default function AdminComplexDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [complex, setComplex] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [approvalNote, setApprovalNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadComplexData();
  }, [id]);

  const loadComplexData = async () => {
    setLoading(true);
    try {
      const [complexResponse, fieldsResponse] = await Promise.all([
        complexService.getComplexAdminDetails(id), // Use new admin-specific endpoint
        fieldService.getFieldsByComplexIdWithTimeSlotCount(id),
      ]);
      
      setComplex(complexResponse.data);
      setFields(fieldsResponse.data || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu cụm sân");
      navigate("/admin/complexes");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (isActive) => {
    try {
      await complexService.toggleComplexActive(id, isActive);
      toast.success(isActive ? "Đã kích hoạt cụm sân" : "Đã tắt cụm sân");
      setComplex((prev) => ({ ...prev, isActive }));
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const openApprovalModal = (action) => {
    setApprovalAction(action);
    setApprovalNote("");
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async () => {
    if (!approvalAction) return;
    
    if (approvalAction === "reject" && !approvalNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setProcessing(true);
    try {
      if (approvalAction === "approve") {
        await complexService.approveComplex(id);
        toast.success("Đã phê duyệt cụm sân thành công");
      } else {
        await complexService.rejectComplex(id, approvalNote);
        toast.success("Đã từ chối cụm sân");
      }
      
      setShowApprovalModal(false);
      setApprovalNote("");
      loadComplexData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleFieldActive = async (fieldId, isActive) => {
    try {
      await fieldService.toggleFieldActive(fieldId, isActive);
      toast.success(isActive ? "Đã kích hoạt sân" : "Đã tắt sân");
      // Reload fields
      const fieldsResponse = await fieldService.getFieldsByComplexIdWithTimeSlotCount(id);
      setFields(fieldsResponse.data || []);
    } catch (error) {
      toast.error("Cập nhật trạng thái sân thất bại");
    }
  };

  const handleFieldClick = (field) => {
    navigate(`/admin/complexes/${id}/fields/${field.id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Client-side pagination
  const paginatedFields = fields.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(fields.length / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // DataTable columns
  const fieldColumns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="font-semibold text-gray-900">{row.id}</span>
      ),
    },
    {
      key: "name",
      label: "Tên sân",
      render: (field) => <span className="font-semibold">{field.name}</span>,
    },
    {
      key: "fieldSize",
      label: "Loại sân",
      render: (field) => (
        <span className="text-gray-600">
          {field.fieldSize || field.fieldType || "Chưa rõ"}
        </span>
      ),
    },
    {
      key: "surfaceType",
      label: "Mặt sân",
      render: (field) => (
        <span className="text-gray-600">{field.surfaceType || "Chưa có"}</span>
      ),
    },
    {
      key: "timeSlotCount",
      label: "Khung giờ",
      render: (field) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {field.timeSlotCount || 0} khung
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (field) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ToggleSwitch
            enabled={field.isActive}
            onChange={(enabled) => handleToggleFieldActive(field.id, enabled)}
          />
        </div>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (field) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFieldClick(field);
            }}
            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
            title="Xem chi tiết"
          >
            <MdVisibility className="text-lg" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!complex) {
    return <EmptyState title="Không tìm thấy cụm sân" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={complex.name}
        breadcrumbs={[
          { label: "Quản lý cụm sân", path: "/admin/complexes" },
          { label: complex.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/complexes")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MdArrowBack />
              Quay lại
            </button>
            
            {complex.status === 0 && (
              <>
                <button
                  onClick={() => openApprovalModal("approve")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MdCheckCircle />
                  Phê duyệt
                </button>
                <button
                  onClick={() => openApprovalModal("reject")}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <MdCancel />
                  Từ chối
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Complex Info Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Main Image */}
        {complex.mainImageUrl && (
          <div className="w-full h-64 bg-gray-200">
            <img
              src={getComplexImageUrl(complex.mainImageUrl)}
              alt={complex.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML =
                  '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"><span class="text-4xl text-slate-400">⚽</span></div>';
              }}
            />
          </div>
        )}

        {/* Image Gallery */}
        {complex.images && complex.images.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <label className="text-sm text-gray-500 font-medium block mb-3">
              Hình ảnh cụm sân ({complex.images.length})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {complex.images.map((image, index) => (
                <div
                  key={image.id || index}
                  className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all"
                >
                  <img
                    src={getImageUrl(image.imageUrl)}
                    alt={`${complex.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='40'%3E⚽%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {image.isMain && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                      Chính
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complex Information */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 font-medium">Mã cụm sân</label>
                <p className="text-lg text-gray-900">#{complex.id}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500 font-medium">Owner</label>
                <p className="text-lg text-gray-900">{complex.ownerName}</p>
                <p className="text-sm text-gray-500">{complex.ownerEmail}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500 font-medium">Địa chỉ</label>
                <p className="text-gray-900">
                  {[complex.street, complex.ward, complex.province]
                    .filter(Boolean)
                    .join(", ") || "Chưa có địa chỉ"}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500 font-medium">Số điện thoại</label>
                <p className="text-gray-900">{complex.phone || "Chưa có"}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500 font-medium">Giờ hoạt động</label>
                <p className="text-gray-900">
                  {complex.openingTime && complex.closingTime
                    ? `${formatTimeSpan(complex.openingTime)} - ${formatTimeSpan(complex.closingTime)}`
                    : "Chưa đặt"}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 font-medium">Trạng thái phê duyệt</label>
                <div className="mt-1">
                  <ComplexStatusBadge status={complex.status} />
                </div>
              </div>

              {complex.status === 2 && complex.rejectionReason && (
                <div>
                  <label className="text-sm text-gray-500 font-medium">Lý do từ chối</label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{complex.rejectionReason}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-500 font-medium">Trạng thái hoạt động</label>
                <div className="mt-2">
                  <ToggleSwitch
                    enabled={complex.isActive}
                    onChange={handleToggleActive}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 font-medium">Đánh giá</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-yellow-500">
                    {complex.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-gray-500">
                    ({complex.reviewCount || 0} đánh giá)
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 font-medium">Số lượng sân</label>
                <p className="text-2xl font-bold text-blue-600">{fields.length}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {complex.description && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="text-sm text-gray-500 font-medium block mb-2">
                Mô tả
              </label>
              <p className="text-gray-700 whitespace-pre-line">{complex.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Fields Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Danh sách sân ({fields.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Xem thông tin chi tiết các sân thuộc cụm sân này
            </p>
          </div>
        </div>

        {fields.length === 0 ? (
          <EmptyState
            title="Chưa có sân nào"
            description="Cụm sân này chưa có sân nào được tạo"
          />
        ) : (
          <>
            <DataTable
              columns={fieldColumns}
              data={paginatedFields}
              onRowClick={handleFieldClick}
              emptyMessage="Không có dữ liệu"
            />

            {fields.length > pageSize && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalRecords={fields.length}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <Modal
          title={approvalAction === "approve" ? "Phê duyệt cụm sân" : "Từ chối cụm sân"}
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Tên cụm sân:</p>
              <p className="font-semibold text-gray-900">{complex.name}</p>
              
              <p className="text-sm text-gray-600 mt-3 mb-1">Địa chỉ:</p>
              <p className="text-gray-900">
                {[complex.street, complex.ward, complex.province]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <p className="text-sm text-gray-600 mt-3 mb-1">Số sân:</p>
              <p className="text-gray-900">{fields.length} sân</p>
            </div>

            {approvalAction === "reject" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Nhập lý do từ chối cụm sân này..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}

            {approvalAction === "approve" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Bạn có chắc chắn muốn phê duyệt cụm sân này? 
                  Sau khi phê duyệt, cụm sân sẽ hiển thị công khai trên hệ thống.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowApprovalModal(false)}
                disabled={processing}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleApprovalSubmit}
                disabled={processing}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  approvalAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50`}
              >
                {processing ? "Đang xử lý..." : approvalAction === "approve" ? "Phê duyệt" : "Từ chối"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
