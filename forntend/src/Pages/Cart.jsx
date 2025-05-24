import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartItemCount,
    clearCart,
    setIsCartOpen,
  } = useCart();

  if (cartItemCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 min-h-screen text-center">
        <h1 className="text-4xl font-bold mb-4">Your Cart is Empty 🛒</h1>
        <p className="text-lg text-gray-600 mb-6">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/"
          className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          onClick={() => setIsCartOpen(false)}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Safely calculate base price total
  const basePriceTotal = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const basePrice = Number(item.basePrice) || price;
    const quantity = Number(item.quantity) || 1;
    return sum + (basePrice * quantity);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-4xl font-bold mb-10">Your Cart ({cartItemCount})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => {
            // Safely get prices for each item
            const price = Number(item.price) || 0;
            const basePrice = Number(item.basePrice) || price;
            const quantity = Number(item.quantity) || 1;
            const totalPrice = (price * quantity).toFixed(2);
            const displayBasePrice = basePrice.toFixed(2);

            return (
              <div
                key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow"
              >
                <div className="w-full sm:w-32 h-32 flex-shrink-0">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-gray-500 text-sm">
                        Color: <span className="capitalize">{item.selectedColor}</span> | Size: {item.selectedSize}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${totalPrice}</p>
                      {item.basePrice && !isNaN(basePrice) && basePrice !== price && (
                        <p className="text-sm text-gray-500">${displayBasePrice} base</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border rounded overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, quantity - 1)}
                        disabled={quantity <= 1}
                        className={`px-4 py-2 ${quantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                      >
                        -
                      </button>
                      <span className="px-4">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, quantity + 1)}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 hover:underline text-sm"
            >
              Clear Cart
            </button>
            <Link
              to="/"
              className="text-gray-600 hover:text-black text-sm"
              onClick={() => setIsCartOpen(false)}
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 lg:sticky top-20">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({cartItemCount} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              {!isNaN(basePriceTotal) && basePriceTotal !== cartTotal && (
                <div className="flex justify-between">
                  <span>Customization Fees</span>
                  <span>${(cartTotal - basePriceTotal).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between border-t pt-4 font-semibold text-base">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-6 block w-full bg-black text-white text-center py-3 rounded-md hover:bg-gray-800 transition-colors"
              onClick={() => setIsCartOpen(false)}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;