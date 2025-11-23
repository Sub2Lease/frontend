import { Button } from "@/components/ui/button";
import { useActivateSmartPayments } from "@/hooks/useActivateSmartPayments";

const ActivateSmartPaymentsButton = ({ agreement, userProfile }) => {
  const { activate } = useActivateSmartPayments();

  return (
    <Button
      size="sm"
      onClick={() => activate(agreement)}
    >
      Activate Smart Payments
    </Button>
  );
};

export default ActivateSmartPaymentsButton;