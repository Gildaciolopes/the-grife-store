"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { orderItemTable, orderTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";
import { auth } from "@/lib/auth";

import {
  GenerateWhatsAppOrderSchema,
  generateWhatsAppOrderSchema,
} from "./schema";

export const generateWhatsAppOrder = async (
  data: GenerateWhatsAppOrderSchema,
) => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const { orderId } = generateWhatsAppOrderSchema.parse(data);
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }
  const orderItems = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    with: {
      productVariant: { with: { product: true } },
    },
  });

  const whatsappNumber = process.env.WHATSAPP_NUMBER;
  if (!whatsappNumber) {
    throw new Error("WhatsApp number is not configured");
  }

  // topo do arquivo
  const E = {
    cart: "\u{1F6D2}", // 🛒
    person: "\u{1F464}", // 👤
    email: "\u{1F4E7}", // 📧
    phone: "\u{1F4F1}", // 📱
    id: "\u{1F194}", // 🆔
    pin: "\u{1F4CD}", // 📍
    package: "\u{1F4E6}", // 📦
    money: "\u{1F4B5}", // 💵
    hourglass: "\u{23F3}", // ⏳
  };

  let message = `${E.cart} *NOVO PEDIDO - ${order.id.slice(0, 8).toUpperCase()}*\n\n`;
  message += `${E.person} *Cliente:* ${order.recipientName}\n`;
  message += `${E.email} *Email:* ${order.email}\n`;
  message += `${E.phone} *Telefone:* ${order.phone}\n`;
  message += `${E.id} *CPF/CNPJ:* ${order.cpfOrCnpj}\n\n`;
  message += `${E.pin} *Endereço de Entrega:*\n`;
  message += `${order.street}, ${order.number}\n`;
  if (order.complement) {
    message += `${order.complement}\n`;
  }
  message += `${order.neighborhood}\n`;
  message += `${order.city} - ${order.state}\n`;
  message += `CEP: ${order.zipCode}\n\n`;
  message += `${E.package} *Itens do Pedido:*\n`;

  orderItems.forEach((item, index) => {
    message += `${index + 1}. ${item.productVariant.product.name} - ${item.productVariant.name}\n`;
    message += `   Quantidade: ${item.quantity}\n`;
    message += `   Preço unitário: ${formatCentsToBRL(item.priceInCents)}\n`;
    message += `   Subtotal: ${formatCentsToBRL(item.priceInCents * item.quantity)}\n\n`;
  });

  message += `${E.money} *Total do Pedido:* ${formatCentsToBRL(order.totalPriceInCents)}\n\n`;
  message += `${E.hourglass} *Status:* Aguardando confirmação`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

  return { whatsappUrl };
};
