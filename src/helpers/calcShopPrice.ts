export default function calcShopPrice(price: number, discount: number) {
  return Math.trunc(price * (100 - discount)) / 100;
}
