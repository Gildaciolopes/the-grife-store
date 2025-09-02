"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFinishOrder } from "@/hooks/mutations/use-finish-order";
import { useGenerateWhatsAppOrder } from "@/hooks/mutations/use-generate-whatsapp-order";

const FinishOrderButton = () => {
  const finishOrderMutation = useFinishOrder();
  const generateWhatsAppOrderMutation = useGenerateWhatsAppOrder();

  const handleFinishOrder = async () => {
    const { orderId } = await finishOrderMutation.mutateAsync();
    const { whatsappUrl } = await generateWhatsAppOrderMutation.mutateAsync({
      orderId,
    });
    window.open(whatsappUrl, "_blank");
  };

  const isLoading =
    finishOrderMutation.isPending || generateWhatsAppOrderMutation.isPending;

  return (
    <>
      <Button
        className="w-full rounded-full"
        size="lg"
        onClick={handleFinishOrder}
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        Envie no WhatsApp e compre
      </Button>
    </>
  );
};

export default FinishOrderButton;
