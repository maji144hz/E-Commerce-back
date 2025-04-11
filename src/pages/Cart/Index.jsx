import { useContext } from "react";
import useCart from "../../hooks/useCart";
import { FaTrashCan } from "react-icons/fa6";
import { AuthContext } from "../../context/AuthContext";
import cartService from "../../services/cart.service";
import Swal from "sweetalert2";
import PaymentButton from "../../components/PaymentButton";

const Index = () => {
  const [cart, refetch] = useCart();
  const { user } = useContext(AuthContext);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  const handleDeleteItem = async (cartItem) => {
    Swal.fire({
      icon: "question",
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      cancelButtonColor: "#d33",
      confirmButtonColor: "#3085d6",
      showConfirmButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await cartService.deleteCartItem(cartItem._id);
          if (response.status === 200) {
            refetch();
            Swal.fire({
              icon: "success",
              title: "Delete Success",
              text: response.message,
            });
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
          });
        }
      }
    });
  };

  const handleIncrease = async (cartItem) => {
    try {
      if (!cartItem || !cartItem._id) return;

      const response = await cartService.updateCart(cartItem._id, {
        quantity: cartItem.quantity + 1,
      });

      if (response.status === 200) {
        refetch();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update cart",
      });
    }
  };

  const handleDecrease = async (cartItem) => {
    try {
      if (!cartItem || !cartItem._id) return;

      if (cartItem.quantity <= 1) {
        Swal.fire({
          icon: "warning",
          title: "Cannot Decrease",
          text: "Quantity cannot be less than 1",
        });
        return;
      }

      const response = await cartService.updateCart(cartItem._id, {
        quantity: cartItem.quantity - 1,
      });

      if (response.status === 200) {
        refetch();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update cart",
      });
    }
  };

  const totalPrice = (items = []) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h2>
        <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อดูตะกร้าสินค้า</p>
      </div>
    );
  }

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">ตะกร้าสินค้าว่าง</h2>
        <p className="text-gray-600">กรุณาเลือกสินค้าเพื่อเพิ่มลงในตะกร้า</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-w-screen-md mx-auto">
      <table className="table table-compact w-full">
        <thead>
          <tr className="bg-red font-semibold text-white">
            <th>#</th>
            <th>Product</th>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Price Per Unit</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={item._id || index}>
              <td>{index + 1}</td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle h-12 w-12">
                      <img
                        src={item.image || "https://img.daisyui.com/images/profile/demo/2@94.webp"}
                        alt="Product"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-sm opacity-50">{item.description}</div>
                  </div>
                </div>
              </td>
              <td>{item.name}</td>
              <td>
                <div className="flex items-center">
                  <button
                    className="btn btn-xs btn-outline btn-primary"
                    onClick={() => handleDecrease(item)}
                  >
                    -
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    className="btn btn-xs btn-outline btn-primary"
                    onClick={() => handleIncrease(item)}
                  >
                    +
                  </button>
                </div>
              </td>
              <td>{formatPrice(item.price)}</td>
              <td>{formatPrice(item.price * item.quantity)}</td>
              <td>
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => handleDeleteItem(item)}
                >
                  <FaTrashCan />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <div className="text-xl font-bold">
          Total: {formatPrice(totalPrice(cart))}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <PaymentButton cart={cart} />
      </div>
    </div>
  );
};

export default Index;