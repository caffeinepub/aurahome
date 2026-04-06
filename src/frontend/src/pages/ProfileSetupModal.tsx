import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface ProfileSetupModalProps {
  open: boolean;
}

export function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={open} data-ocid="profile_setup.dialog">
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 mx-auto mb-4">
            <User size={26} className="text-blue-500" />
          </div>
          <DialogTitle className="text-center text-xl">
            Set up your profile
          </DialogTitle>
          <DialogDescription className="text-center">
            Tell us your name so we can personalize your AuraHome experience.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Your Name</Label>
            <Input
              id="profile-name"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              data-ocid="profile_setup.input"
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full"
            data-ocid="profile_setup.submit_button"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
