
export const ORDER_STATUS = ['waiting','confirmed','preparing','ready','delivered','cancelled'] as const;
export type OrderStatus = typeof ORDER_STATUS[number];
export const statusLabel = (s: OrderStatus) => ({
  waiting:'En attente', confirmed:'Confirmée', preparing:'En préparation', ready:'Prête', delivered:'Livrée', cancelled:'Annulée'
}[s]);
export const statusClass = (s: OrderStatus) => ({
  waiting:'badge-waiting', confirmed:'badge-confirmed', preparing:'badge-prep', ready:'badge-ready', delivered:'badge-delivered', cancelled:'badge-cancelled'
}[s]);
