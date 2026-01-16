import { Link } from 'react-router-dom';
import { FaUniversity, FaMoneyBillWave, FaUsers, FaBook, FaUserCircle } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const cards = [
    {
      title: 'All Groups',
      description: 'View and manage all group bookings',
      icon: <FaUsers />,
      link: '/dashboard/all-groups',
      color: '#3b82f6'
    },
    {
      title: 'Bank Details',
      description: 'View bank account information',
      icon: <FaUniversity />,
      link: '/dashboard/banks',
      color: '#10b981'
    },
    {
      title: 'Payment',
      description: 'Make payments and view payment history',
      icon: <FaMoneyBillWave />,
      link: '/dashboard/payment',
      color: '#f59e0b'
    },
    {
      title: 'Ledger',
      description: 'View your account ledger and transactions',
      icon: <FaBook />,
      link: '/dashboard/ledger',
      color: '#8b5cf6'
    },
    {
      title: 'Profile',
      description: 'View and update your profile information',
      icon: <FaUserCircle />,
      link: '/dashboard/profile',
      color: '#ec4899'
    }
  ];

  return (
    <div className="dashboard-home">
      <div className="dashboard-welcome">
        <h2>Welcome to Agent Dashboard</h2>
        <p>Manage your bookings, payments, and account information</p>
      </div>

      <div className="dashboard-cards">
        {cards.map((card, index) => (
          <Link to={card.link} key={index} className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: card.color }}>
              {card.icon}
            </div>
            <div className="card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
