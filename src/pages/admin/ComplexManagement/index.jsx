import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdVisibility, MdCheckCircle, MdCancel, MdStore } from "react-icons/md";
import PageHeader from "../../../components/dashboard/PageHeader";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import EmptyState from "../../../components/dashboard/EmptyState";
import DataTable from "../../../components/dashboard/DataTable";
import Pagination from "../../../components/common/Pagination";
import ComplexStatusBadge from "../../../components/owner/ComplexStatusBadge";
import ToggleSwitch from "../../../components/owner/ToggleSwitch";
import Modal from "../../../components/dashboard/Modal";
import complexService from "../../../services/complexService";
import { useToast } from "../../../store/toastStore";
import { formatTimeSpan } from "../../../utils/formatHelpers";

/**
 * Admin Complex Management - View Only với Approval Actions
 * Hiển thị danh sách tất cả Complex trong hệ thống
 */
export default function AdminComplexManagement() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [complexes, setComplexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null); // 'approve' or 'reject'
  const [selectedComplex, setSelectedComplex] = useState(null);
  const [approvalNote, setApprovalNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchComplexes();
  }, [currentPage, pageSize]);

  const fetchComplexes = async () => {
    setLoading(true);
    try {
      const response = await complexService.getAllComplexesForAdmin({
        pageIndex: currentPage,
        pageSize: pageSize,
      });

      console.log('Admin complexes response:', response);

      // Response structure: { data: [...], pageIndex: 1, ... }
      if (response && response.data) {
        setComplexes(response.data || []);
        setPagination({
          currentPage: response.pageIndex,
          totalPages: response.totalPages,
          totalRecords: response.totalRecords,
          pageSize: response.pageSize,
          hasNextPage: response.pageIndex < response.totalPages,
          hasPreviousPage: response.pageIndex > 1,
        });
      }
    } catch (error) {
      console.error('Error fetching complexes:', error);
      toast.error("Không thể tải danh sách cụm sân");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (complexId, isActive) => {
    try {
      await complexService.toggleComplexActive(complexId, isActive);
      toast.success(isActive ? "Đã kích hoạt cụm sân" : "Đã tắt cụm sân");
      fetchComplexes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const openApprovalModal = (complex, action) => {
    setSelectedComplex(complex);
    setApprovalAction(action);
    setApprovalNote("");
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedComplex || !approvalAction) return;
    
    if (approvalAction === "reject" && !approvalNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setProcessing(true);
    try {
      if (approvalAction === "approve") {
        await complexService.approveComplex(selectedComplex.id);
        toast.success("Đã phê duyệt cụm sân thành công");
      } else {
        await complexService.rejectComplex(selectedComplex.id, approvalNote);
        toast.success("Đã từ chối cụm sân");
      }
      
      setShowApprovalModal(false);
      setSelectedComplex(null);
      setApprovalNote("");
      fetchComplexes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const handleRowClick = (complex) => {
    navigate(`/admin/complexes/${complex.id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Filter complexes
  const filteredComplexes = complexes.filter((complex) => {
    const matchesSearch = searchTerm === "" || 
      complex.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complex.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complex.ward?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complex.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complex.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || complex.status === parseInt(statusFilter);
    const matchesActive = activeFilter === "all" || 
      (activeFilter === "active" && complex.isActive) ||
      (activeFilter === "inactive" && !complex.isActive);

    return matchesSearch && matchesStatus && matchesActive;
  });

  // Table columns
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="font-semibold text-gray-900">{row.id}</span>,
    },
    {
      key: "name",
      label: "Tên cụm sân",
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-900 block">{row.name}</span>
          <span className="text-xs text-gray-500">Owner ID: {row.ownerId}</span>
        </div>
      ),
    },
    {
      key: "address",
      label: "Địa chỉ",
      render: (row) => {
        const parts = [row.street, row.ward, row.province].filter(Boolean);
        return <span className="text-gray-600">{parts.join(", ") || "Chưa có địa chỉ"}</span>;
      },
    },
    {
      key: "phone",
      label: "Số điện thoại",
      render: (row) => <span className="text-gray-600">{row.phone || "-"}</span>,
    },
    {
      key: "hours",
      label: "Giờ hoạt động",
      render: (row) => (
        <span className="text-gray-600 text-sm">
          {row.openingTime && row.closingTime
            ? `${formatTimeSpan(row.openingTime)} - ${formatTimeSpan(row.closingTime)}`
            : "Chưa đặt"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => <ComplexStatusBadge status={row.status} />,
    },
    {
      key: "isActive",
      label: "Hoạt động",
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ToggleSwitch
            enabled={row.isActive}
            onChange={(enabled) => handleToggleActive(row.id, enabled)}
          />
        </div>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(row);
            }}
            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
            title="Xem chi tiết"
          >
            <MdVisibility className="text-lg" />
          </button>
          
          {row.status === 0 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openApprovalModal(row, "approve");
                }}
                className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                title="Phê duyệt"
              >
                <MdCheckCircle className="text-lg" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openApprovalModal(row, "reject");
                }}
                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                title="Từ chối"
              >
                <MdCancel className="text-lg" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading && complexes.length === 0) {
    return (
      <div>
        <PageHeader title="Quản lý cụm sân" />
        <LoadingSkeleton type="table" rows={10} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Quản lý cụm sân"
        subtitle="Xem và quản lý tất cả cụm sân trong hệ thống"
      />

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên, địa chỉ, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái phê duyệt
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="0">Chờ duyệt</option>
              <option value="1">Đã duyệt</option>
              <option value="2">Từ chối</option>
            </select>
          </div>

          {/* Active Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái hoạt động
            </label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã tắt</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{pagination.totalRecords}</div>
              <div className="text-sm text-gray-600">Tổng cụm sân</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {complexes.filter(c => c.status === 0).length}
              </div>
              <div className="text-sm text-gray-600">Chờ duyệt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {complexes.filter(c => c.status === 1).length}
              </div>
              <div className="text-sm text-gray-600">Đã duyệt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {complexes.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Đang hoạt động</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {filteredComplexes.length === 0 ? (
        <EmptyState 
          icon={MdStore}
          title="Không có cụm sân nào"
          message="Không tìm thấy cụm sân phù hợp với bộ lọc"
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredComplexes}
            onRowClick={handleRowClick}
            emptyMessage="Không có dữ liệu"
          />

          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            pageSize={pageSize}
            totalRecords={pagination.totalRecords}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

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
              <p className="font-semibold text-gray-900">{selectedComplex?.name}</p>
              
              <p className="text-sm text-gray-600 mt-3 mb-1">Địa chỉ:</p>
              <p className="text-gray-900">
                {[selectedComplex?.street, selectedComplex?.ward, selectedComplex?.province]
                  .filter(Boolean)
                  .join(", ")}
              </p>
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
