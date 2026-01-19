import { Link } from 'react-router-dom';
import { FaUniversity, FaMoneyBillWave, FaUsers, FaBook, FaUserCircle } from 'react-icons/fa';

const Dashboard = () => {
  const cards = [
    {
      title: 'All Groups',
      description: 'View and manage all group bookings',
      icon: <FaUsers />,
      link: '/dashboard/all-groups',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Bank Details',
      description: 'View bank account information',
      icon: <FaUniversity />,
      link: '/dashboard/banks',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Payment',
      description: 'Make payments and view payment history',
      icon: <FaMoneyBillWave />,
      link: '/dashboard/payment',
      color: 'from-amber-500 to-amber-600'
    },
    {
      title: 'Ledger',
      description: 'View your account ledger and transactions',
      icon: <FaBook />,
      link: '/dashboard/ledger',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Profile',
      description: 'View and update your profile information',
      icon: <FaUserCircle />,
      link: '/dashboard/profile',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="w-full min-h-screen mx-auto px-2 sm:px-4 md:px-0">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Welcome to Agent Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your bookings, payments, and account information</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, index) => (
          <Link
            to={card.link}
            key={index}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className={`bg-gradient-to-r ${card.color} p-4 sm:p-6 flex items-center justify-center`}>
              <div className="text-white text-3xl sm:text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors">
                {card.title}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
