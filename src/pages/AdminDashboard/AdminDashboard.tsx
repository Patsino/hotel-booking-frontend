import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Loading } from '../../components/Loading/Loading';
import { Toast } from '../../components/Toast/Toast';
import { format } from 'date-fns';
import './AdminDashboard.css';

type AdminHotel = {
  id: number;
  ownerId: number;
  name: string;
  country: string;
  city: string;
  district: string;
  description: string;
  submittedAt: string;
  approval: string;
  reviewedAt?: string;
};

type AdminReservation = {
  id: number;
  userId: number;
  roomId: number;
  startDate: string;
  endDate: string;
  status: string;
  cancellationStatus: string;
  cancellationReason: string | null;
  cancellationRequestedAt: string | null;
  createdAt: string;
};

type AdminUser = {
  id: number;
  email: string;
  role: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
};

export const AdminDashboard: React.FC = () => {
  const { role, userId } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'hotels' | 'reservations' | 'users'>('hotels');
  
  // Hotels state
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [hotelFilter, setHotelFilter] = useState<string>('');
  const [hotelsLoading, setHotelsLoading] = useState(false);
  
  // Reservations state
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [reservationStatusFilter, setReservationStatusFilter] = useState<string>('');
  const [cancellationFilter, setCancellationFilter] = useState<string>('');
  const [reservationsLoading, setReservationsLoading] = useState(false);
  
  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userEmailFilter, setUserEmailFilter] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [userDeletedFilter, setUserDeletedFilter] = useState<string>('');
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Common state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'hotels') {
      fetchHotels();
    } else if (activeTab === 'reservations') {
      fetchReservations();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchHotels = async (status?: string) => {
    setHotelsLoading(true);
    try {
      const data = await adminService.getAllHotels(status);
      setHotels(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setHotelsLoading(false);
    }
  };

  const fetchReservations = async () => {
    setReservationsLoading(true);
    try {
      const data = await adminService.getAllReservations(
        reservationStatusFilter || undefined,
        cancellationFilter || undefined
      );
      setReservations(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setReservationsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const isDeletedParam = userDeletedFilter === '' ? undefined : userDeletedFilter === 'true';
      const data = await adminService.getAllUsers(
        userEmailFilter || undefined,
        userRoleFilter || undefined,
        isDeletedParam
      );
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUsersLoading(false);
    }
  };

  const handleApproveHotel = async (hotelId: number) => {
    try {
      await adminService.approveHotel(hotelId);
      setSuccess('Hotel approved successfully');
      fetchHotels(hotelFilter || undefined);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRejectHotel = async (hotelId: number) => {
    try {
      await adminService.rejectHotel(hotelId);
      setSuccess('Hotel rejected');
      fetchHotels(hotelFilter || undefined);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleApproveCancellation = async (reservationId: number) => {
    try {
      await adminService.approveCancellation(reservationId);
      setSuccess('Cancellation approved and refund initiated');
      fetchReservations();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRejectCancellation = async (reservationId: number) => {
    try {
      await adminService.rejectCancellation(reservationId);
      setSuccess('Cancellation rejected');
      fetchReservations();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdateUserRole = async (targetUserId: number, newRole: string) => {
    try {
      await adminService.updateUserRole(targetUserId, newRole);
      setSuccess(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSoftDeleteUser = async (targetUserId: number) => {
    if (targetUserId === userId) {
      setError('You cannot delete your own account from the admin panel');
      return;
    }
    try {
      await adminService.softDeleteUser(targetUserId);
      setSuccess('User soft-deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRestoreUser = async (targetUserId: number) => {
    try {
      await adminService.restoreUser(targetUserId);
      setSuccess('User restored successfully');
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (role !== 'Admin') {
    return (
      <div className="admin-dashboard">
        <Card>
          <h2>Access Denied</h2>
          <p>This area is restricted to administrators only.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="admin-container">
        <h1 className="admin-title">Admin Dashboard</h1>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'hotels' ? 'active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            Hotel Approvals
          </button>
          <button
            className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            Reservation Management
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        </div>

        {activeTab === 'hotels' && (
          <div className="admin-section">
            <Card>
              <div className="filter-section">
                <h3>Filter Hotels</h3>
                <div className="filter-controls">
                  <select
                    value={hotelFilter}
                    onChange={(e) => {
                      setHotelFilter(e.target.value);
                      fetchHotels(e.target.value || undefined);
                    }}
                    className="filter-select"
                  >
                    <option value="">All Hotels</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </Card>

            {hotelsLoading ? (
              <Loading />
            ) : hotels.length === 0 ? (
              <Card>
                <p className="no-data">No hotels found</p>
              </Card>
            ) : (
              <div className="admin-grid">
                {hotels.map((hotel) => (
                  <Card key={hotel.id} className="admin-card">
                    <div className="admin-card-header">
                      <h3>#{hotel.id} - {hotel.name}</h3>
                      <span className={`status-badge status-${hotel.approval.toLowerCase()}`}>
                        {hotel.approval}
                      </span>
                    </div>
                    <div className="admin-card-body">
                      <p><strong>Location:</strong> {hotel.city}, {hotel.country}</p>
                      {hotel.district && <p><strong>District:</strong> {hotel.district}</p>}
                      <p><strong>Owner ID:</strong> {hotel.ownerId}</p>
                      <p><strong>Description:</strong> {hotel.description}</p>
                      <p><strong>Submitted:</strong> {format(new Date(hotel.submittedAt), 'PPp')}</p>
                      {hotel.reviewedAt && (
                        <p><strong>Reviewed:</strong> {format(new Date(hotel.reviewedAt), 'PPp')}</p>
                      )}
                    </div>
                    {hotel.approval === 'Pending' && (
                      <div className="admin-card-actions">
                        <Button onClick={() => handleApproveHotel(hotel.id)} variant="primary">
                          ✓ Approve
                        </Button>
                        <Button onClick={() => handleRejectHotel(hotel.id)} variant="secondary">
                          ✗ Reject
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="admin-section">
            <Card>
              <div className="filter-section">
                <h3>Filter Reservations</h3>
                <div className="filter-controls">
                  <select
                    value={reservationStatusFilter}
                    onChange={(e) => setReservationStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Held">Held</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                  <select
                    value={cancellationFilter}
                    onChange={(e) => setCancellationFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Cancellations</option>
                    <option value="None">None</option>
                    <option value="Requested">Requested</option>
                    <option value="AutoCanceled">Auto-Canceled</option>
                    <option value="AdminApproved">Admin Approved</option>
                    <option value="AdminRejected">Admin Rejected</option>
                  </select>
                  <Button onClick={fetchReservations}>Apply Filters</Button>
                </div>
              </div>
            </Card>

            {reservationsLoading ? (
              <Loading />
            ) : reservations.length === 0 ? (
              <Card>
                <p className="no-data">No reservations found</p>
              </Card>
            ) : (
              <div className="admin-grid">
                {reservations.map((reservation) => (
                  <Card key={reservation.id} className="admin-card">
                    <div className="admin-card-header">
                      <h3>Reservation #{reservation.id}</h3>
                      <div className="status-badges">
                        <span className={`status-badge status-${reservation.status.toLowerCase()}`}>
                          {reservation.status}
                        </span>
                        {reservation.cancellationStatus !== 'None' && (
                          <span className={`status-badge status-cancel-${reservation.cancellationStatus.toLowerCase()}`}>
                            Cancel: {reservation.cancellationStatus}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="admin-card-body">
                      <p><strong>User ID:</strong> {reservation.userId}</p>
                      <p><strong>Room ID:</strong> {reservation.roomId}</p>
                      <p><strong>Check-in:</strong> {format(new Date(reservation.startDate), 'PP')}</p>
                      <p><strong>Check-out:</strong> {format(new Date(reservation.endDate), 'PP')}</p>
                      <p><strong>Created:</strong> {format(new Date(reservation.createdAt), 'PPp')}</p>
                      {reservation.cancellationReason && (
                        <p><strong>Cancellation Reason:</strong> {reservation.cancellationReason}</p>
                      )}
                      {reservation.cancellationRequestedAt && (
                        <p><strong>Cancellation Requested:</strong> {format(new Date(reservation.cancellationRequestedAt), 'PPp')}</p>
                      )}
                    </div>
                    {reservation.cancellationStatus === 'Requested' && (
                      <div className="admin-card-actions">
                        <Button onClick={() => handleApproveCancellation(reservation.id)} variant="primary">
                          ✓ Approve Cancellation
                        </Button>
                        <Button onClick={() => handleRejectCancellation(reservation.id)} variant="secondary">
                          ✗ Reject Cancellation
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <Card>
              <div className="filter-section">
                <h3>Filter Users</h3>
                <div className="filter-controls">
                  <input
                    type="text"
                    value={userEmailFilter}
                    onChange={(e) => setUserEmailFilter(e.target.value)}
                    placeholder="Search by email..."
                    className="filter-input"
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Roles</option>
                    <option value="User">User</option>
                    <option value="HotelOwner">Hotel Owner</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <select
                    value={userDeletedFilter}
                    onChange={(e) => setUserDeletedFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Users</option>
                    <option value="false">Active</option>
                    <option value="true">Deleted</option>
                  </select>
                  <Button onClick={fetchUsers}>Apply Filters</Button>
                </div>
              </div>
            </Card>

            {usersLoading ? (
              <Loading />
            ) : users.length === 0 ? (
              <Card>
                <p className="no-data">No users found</p>
              </Card>
            ) : (
              <div className="admin-grid">
                {users.map((user) => (
                  <Card key={user.id} className="admin-card">
                    <div className="admin-card-header">
                      <h3>User #{user.id}</h3>
                      <div className="status-badges">
                        <span className={`status-badge status-role-${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                        {user.isDeleted && (
                          <span className="status-badge status-deleted">
                            Deleted
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="admin-card-body">
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Created:</strong> {format(new Date(user.createdAt), 'PPp')}</p>
                      {user.deletedAt && (
                        <p><strong>Deleted:</strong> {format(new Date(user.deletedAt), 'PPp')}</p>
                      )}
                    </div>
                    <div className="admin-card-actions user-actions">
                      {!user.isDeleted && user.id !== userId && (
                        <>
                          <select
                            className="role-select"
                            defaultValue={user.role}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          >
                            <option value="User">User</option>
                            <option value="HotelOwner">Hotel Owner</option>
                            <option value="Admin">Admin</option>
                          </select>
                          <Button onClick={() => handleSoftDeleteUser(user.id)} variant="secondary">
                            🗑️ Delete
                          </Button>
                        </>
                      )}
                      {user.isDeleted && (
                        <Button onClick={() => handleRestoreUser(user.id)} variant="primary">
                          ↩️ Restore
                        </Button>
                      )}
                      {user.id === userId && (
                        <span className="current-user-badge">This is you</span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
