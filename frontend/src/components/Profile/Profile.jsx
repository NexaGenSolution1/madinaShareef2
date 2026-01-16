import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../../api/profileApi';
import './Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    city: '',
    country: '',
    consultant: '',
    address: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      if (response.success) {
        const userData = response.data;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          companyName: userData.companyName || '',
          city: userData.city || '',
          country: userData.country || '',
          consultant: userData.consultant || '',
          address: userData.address || '',
        });
        if (userData.logo) {
          setLogoPreview(userData.logo);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields (Name, Email, Phone)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      const updateData = { ...formData };
      
      // If there's a logo file, convert to base64 and include
      if (logoFile) {
        updateData.logo = logoPreview;
      }

      const response = await updateUserProfile(updateData);
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        
        // Update localStorage with new data
        const storedUser = localStorage.getItem("frontend_user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const updatedUser = { ...parsedUser, ...response.data };
          localStorage.setItem("frontend_user", JSON.stringify(updatedUser));
        }
        
        // Refresh profile data
        fetchUserProfile();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="breadcrumb">
          <a href="/">Home</a> / <span>Profile</span>
        </div>
      </div>

      <div className="profile-content">
        <h2>Update Your Profile</h2>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">User Name <span className="required">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                required
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="consultant">Contact Person Name</label>
              <input
                type="text"
                id="consultant"
                name="consultant"
                value={formData.consultant}
                onChange={handleInputChange}
                placeholder="Enter contact person name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone No. <span className="required">*</span></label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Enter country"
              />
            </div>
          </div>

          <div className="form-group logo-upload">
            <label htmlFor="logo">Upload New Logo</label>
            {logoPreview && (
              <div className="logo-preview">
                <img src={logoPreview} alt="Logo preview" />
              </div>
            )}
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
            />
            <small className="help-text">Accepted formats: JPG, PNG, GIF. Max size: 5MB</small>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-update"
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
