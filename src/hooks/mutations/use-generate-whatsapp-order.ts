"use client";

import { useMutation } from "@tanstack/react-query";

import { generateWhatsAppOrder } from "@/actions/generate-whatsapp-order";

export const useGenerateWhatsAppOrder = () => {
  return useMutation({
    mutationFn: generateWhatsAppOrder,
  });
};
