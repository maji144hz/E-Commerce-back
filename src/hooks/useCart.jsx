import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import cartService from "../services/cart.service";

const useCart = () => {
  const { user } = useContext(AuthContext);
  const { refetch, data: cart = [] } = useQuery({
    queryKey: ["carts", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      try {
        const response = await cartService.getCartsByEmail(user.email);
        return response.data || [];
      } catch (error) {
        console.error("Error fetching cart:", error);
        return [];
      }
    },
    enabled: !!user?.email,
  });
  return [cart, refetch];
};

export default useCart;