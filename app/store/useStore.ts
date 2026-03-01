import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BranchStatus {
  name: string
  interval: number
  isOpen: boolean
  message: string
}

interface Geofence {
  id: number
  rest_brId: number
  geofence_id: number
  min_order: number
  delivery_charges: number
  time_type: number
  max_delivery_time: number
  createdAt: string
  action_time: string
  action_by: string
  delivery_eta_range: string
  start_time: string
  end_time: string
  formatted_start_time: string
  formatted_end_time: string
  rest_brIds: number
  area_name: string
  geoFence: string
  lat: string
  lng: string
  type: number
  cityId: number
  tp_code: string | null
  tp_type: string | null
}

interface City {
  id: number
  state_id: number
  creationDate: string | null
  modifiedDate: string | null
  name: string
  geofences: Geofence[]
  restaurant_branches: any[]
}

interface AppState {
  branchStatus: BranchStatus
  orderType: string
  currentCity: City
  currentBranchId: number
  currentLang: string
  userAddress: string | null
  userLocation: string | null
  cartLoading: boolean
  cartItems: any[]
  cartQuantity: number
  cartSubTotal: number
  cartTotal: number
  paymentType: string
  promoCode: string
  promoDiscount: number
  promoFreeDelivery: boolean
  setBranchStatus: (status: BranchStatus) => void
  setOrderType: (type: string) => void
  setCurrentCity: (city: City) => void
  setCurrentBranchId: (id: number) => void
  setCurrentLang: (lang: string) => void
  setUserAddress: (address: string | null) => void
  setUserLocation: (location: string | null) => void
  setCartLoading: (loading: boolean) => void
  setCartItems: (items: any[]) => void
  setCartQuantity: (quantity: number) => void
  setCartSubTotal: (subTotal: number) => void
  setCartTotal: (total: number) => void
  setPaymentType: (type: string) => void
  setPromoCode: (code: string) => void
  addToCart: (item: any) => void
  removeFromCart: (itemId: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      branchStatus: {
        name: 'F',
        interval: 37425602,
        isOpen: true,
        message: 'Welcome!',
      },
      orderType: 'GLOBAL',
      currentCity: {
        id: 31594,
        state_id: 2729,
        creationDate: null,
        modifiedDate: null,
        name: 'Karachi',
        geofences: [
          {
            id: 3996,
            rest_brId: 54940,
            geofence_id: 3996,
            min_order: 500,
            delivery_charges: 300,
            time_type: 1,
            max_delivery_time: 1440,
            createdAt: '2019-02-22 07:19:36',
            action_time: '2025-05-14 11:18:15',
            action_by: 'Rizwan',
            delivery_eta_range: '',
            start_time: '00:00:00',
            end_time: '23:59:59',
            formatted_start_time: '12:00 AM',
            formatted_end_time: '11:59 PM',
            rest_brIds: 0,
            area_name: 'Baloch Colony (Shahrah-e-Faisal)',
            geoFence:
              '[24.86088634716296, 67.07532352775115],[24.85679774421439, 67.07785553306121],[24.858394262404328, 67.08146042197723],[24.857226080385878, 67.08227581351775],[24.860652716350288, 67.08824104636687],[24.865519933747443, 67.08420700400848]',
            lat: '24.86655349648521',
            lng: '67.08322933989582',
            type: 0,
            cityId: 31594,
            tp_code: null,
            tp_type: null,
          },
        ],
        restaurant_branches: [],
      },
      currentBranchId: 54940,
      currentLang: 'en',
      userAddress: null,
      userLocation: null,
      cartLoading: true,
      cartItems: [],
      cartQuantity: 0,
      cartSubTotal: 0,
      cartTotal: 0,
      paymentType: 'COD',
      promoCode: '',
      promoDiscount: 0,
      promoFreeDelivery: false,

      setBranchStatus: (status) => set({ branchStatus: status }),
      setOrderType: (type) => set({ orderType: type }),
      setCurrentCity: (city) => set({ currentCity: city }),
      setCurrentBranchId: (id) => set({ currentBranchId: id }),
      setCurrentLang: (lang) => set({ currentLang: lang }),
      setUserAddress: (address) => set({ userAddress: address }),
      setUserLocation: (location) => set({ userLocation: location }),
      setCartLoading: (loading) => set({ cartLoading: loading }),
      setCartItems: (items) => set({ cartItems: items }),
      setCartQuantity: (quantity) => set({ cartQuantity: quantity }),
      setCartSubTotal: (subTotal) => set({ cartSubTotal: subTotal }),
      setCartTotal: (total) => set({ cartTotal: total }),
      setPaymentType: (type) => set({ paymentType: type }),
      setPromoCode: (code) => set({ promoCode: code }),

      addToCart: (item) =>
        set((state) => ({
          cartItems: [...state.cartItems, item],
          cartQuantity: state.cartQuantity + (item.quantity || 1),
          cartSubTotal: state.cartSubTotal + item.price * (item.quantity || 1),
        })),

      removeFromCart: (itemId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== itemId),
        })),
    }),
    {
      name: 'persist:root',
      partialize: (state) => ({
        branchStatus: state.branchStatus,
        orderType: state.orderType,
        currentCity: state.currentCity,
        currentBranchId: state.currentBranchId,
        currentLang: state.currentLang,
        userAddress: state.userAddress,
        userLocation: state.userLocation,
        cartLoading: state.cartLoading,
        cartItems: state.cartItems,
        cartQuantity: state.cartQuantity,
        cartSubTotal: state.cartSubTotal,
        cartTotal: state.cartTotal,
        paymentType: state.paymentType,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
        promoFreeDelivery: state.promoFreeDelivery,
      }),
    }
  )
)
