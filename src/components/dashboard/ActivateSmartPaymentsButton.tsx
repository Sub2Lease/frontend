// Button component to start the activation of Smart Payments for a given agreement. Only calls the activate function from useActivateSmartPayments.  

import { Button } from "@/components/ui/button";
import { useActivateSmartPayments } from "@/hooks/useActivateSmartPayments";

const ActivateSmartPaymentsButton = ({ agreement, userProfile }) => {
  const { activate } = useActivateSmartPayments();

  return (
    <Button
      size="sm"
      onClick={() => activate(agreement)}
      className="bg-green-600 text-white hover:bg-green-700"
    >
      Activate Smart Payments
    </Button>
  );
};

export default ActivateSmartPaymentsButton;
