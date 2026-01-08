import { useEffect, useState } from "react";
import axiosInstance from "../Api/axios";
import PageMeta from "../components/common/PageMeta";
import PageBreadCrumb from "../components/common/PageBreadCrumb";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  agencyCode?: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended";
  createdAt: string;
}

const RegisteredAgencies = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive" | "Suspended">("All");
  const [approvalLoading, setApprovalLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role - only show agencies
    filtered = filtered.filter((user) => user.role === "Agency");

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.agencyCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId: string, newStatus: "Active" | "Inactive" | "Suspended") => {
    try {
      setApprovalLoading(userId);
      const token = localStorage.getItem("token");
      const response = await axiosInstance.patch(
        `/auth/users/${userId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user
          )
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setApprovalLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-yellow-100 text-yellow-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800";
      case "Agency":
        return "bg-blue-100 text-blue-800";
      case "SubAgent":
        return "bg-indigo-100 text-indigo-800";
      case "User":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <PageMeta title="Registered Agencies" description="Manage and approve registered agencies and users" />
      <PageBreadCrumb pageTitle="Registered Agencies" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="px-4 py-6 md:px-6 xl:px-7.5">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold text-black dark:text-white">
              Manage Agencies
            </h3>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Search by name, email, company, or agency code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary sm:flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="text-gray-500">Loading agencies...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex justify-center py-10">
              <div className="text-gray-500">No agencies found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark text-left">
                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                      Name
                    </th>
                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                      Email
                    </th>
                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                      Company
                    </th>
                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                      Agency Code
                    </th>
                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                      Phone
                    </th>
                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                      Role
                    </th>
                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                      Status
                    </th>
                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                      Joined Date
                    </th>
                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-stroke dark:border-strokedark"
                    >
                      <td className="px-4 py-5">
                        <div className="text-black dark:text-white">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.companyName || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {user.agencyCode || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.phone}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${getStatusBadgeColor(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <select
                          value={user.status}
                          onChange={(e) =>
                            updateUserStatus(
                              user._id,
                              e.target.value as "Active" | "Inactive" | "Suspended"
                            )
                          }
                          disabled={approvalLoading === user._id}
                          className="rounded border border-stroke bg-transparent px-3 py-2 text-sm outline-none transition focus:border-primary disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {!loading && (
            <div className="mt-6 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>Total Agencies: <span className="font-semibold">{users.filter(u => u.role === "Agency").length}</span></div>
              <div>Active: <span className="font-semibold">{users.filter(u => u.role === "Agency" && u.status === "Active").length}</span></div>
              <div>Inactive: <span className="font-semibold">{users.filter(u => u.role === "Agency" && u.status === "Inactive").length}</span></div>
              <div>Suspended: <span className="font-semibold">{users.filter(u => u.role === "Agency" && u.status === "Suspended").length}</span></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RegisteredAgencies;
