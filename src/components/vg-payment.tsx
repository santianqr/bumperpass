import { PayButton } from "./pay-button";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CouponField } from "@/components/coupon-field";

export function VGPayment() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <p className="text-center text-sm">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda
        reiciendis quis itaque quas aliquam, nihil quidem. Vel assumenda aut
        ipsa rem tempora quis, labore adipisci consequuntur dolorem odio
        distinctio quia?
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <PayButton />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Redeem Coupon</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Do you have a coupon?</AlertDialogTitle>
                <AlertDialogDescription>
                  If you have a coupon, you can redeem it here.
                  <CouponField />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
    </div>
  );
}
