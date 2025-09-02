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

  let message = `🛒 *NOVO PEDIDO - ${order.id.slice(0, 8).toUpperCase()}*\n\n`;
  message += `👤 *Cliente:* ${order.recipientName}\n`;
  message += `📧 *Email:* ${order.email}\n`;
  message += `📱 *Telefone:* ${order.phone}\n`;
  message += `🆔 *CPF/CNPJ:* ${order.cpfOrCnpj}\n\n`;
  message += `📍 *Endereço de Entrega:*\n`;
  message += `${order.street}, ${order.number}\n`;
  if (order.complement) {
    message += `${order.complement}\n`;
  }
  message += `${order.neighborhood}\n`;
  message += `${order.city} - ${order.state}\n`;
  message += `CEP: ${order.zipCode}\n\n`;
  message += `📦 *Itens do Pedido:*\n`;

  orderItems.forEach((item, index) => {
    message += `${index + 1}. ${item.productVariant.product.name} - ${item.productVariant.name}\n`;
    message += `   Quantidade: ${item.quantity}\n`;
    message += `   Preço unitário: ${formatCentsToBRL(item.priceInCents)}\n`;
    message += `   Subtotal: ${formatCentsToBRL(item.priceInCents * item.quantity)}\n\n`;
  });

  message += `💵 *Total do Pedido:* ${formatCentsToBRL(order.totalPriceInCents)}\n\n`;
  message += `⏳ *Status:* Aguardando confirmação`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return { whatsappUrl };
};
