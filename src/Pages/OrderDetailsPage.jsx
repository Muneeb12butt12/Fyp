import { useLocation, useNavigate } from 'react-router-dom';

const OrderDetailsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  if (!order) {
    navigate('/'); // Redirect if no order data
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Details</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Product Information</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td className="px-4 py-3 border-b">{item.id}</td>
                    <td className="px-4 py-3 border-b">
                      <div>{item.title}</div>
                      <div className="text-sm">Price: PKR {item.price.toFixed(2)}</div>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <button className="text-blue-600">Update Stock</button>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b">{formatDate(order.date)}</td>
                  </tr>
                  <tr>
                    <td colSpan="5" className="px-4 py-2 border-b">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>Discount: {item.discount || 0}%</div>
                        <div>Category: {item.category || 'Track Suits'}</div>
                        <div>Only {item.stock || 0} Left</div>
                        <div>{item.active ? 'Active' : 'InActive'}</div>
                      </div>
                      <div className="mt-1 text-sm">Size: {item.sizes?.join(', ') || 'XS,S,M,L,XL,XXL'}</div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsPage;