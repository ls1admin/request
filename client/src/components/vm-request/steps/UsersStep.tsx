import { Plus, Trash2, UserPlus } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StepHeader } from "@/components/ui/step-header";
import type { VMRequest } from "@/types/vm-request";

export function UsersStep() {
  const form = useFormContext<VMRequest>();

  const addUser = () => {
    const currentUsers = form.getValues("additionalUsers") || [];
    form.setValue("additionalUsers", [...currentUsers, ""]);
  };

  const removeUser = (index: number) => {
    const currentUsers = form.getValues("additionalUsers") || [];
    form.setValue(
      "additionalUsers",
      currentUsers.filter((_, i) => i !== index),
    );
  };

  const users = form.watch("additionalUsers") || [];

  return (
    <div className="space-y-6">
      <StepHeader
        title="Additional User Accounts"
        description="Add usernames for other users who should have access to this VM."
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Users</h3>
            <p className="text-sm text-muted-foreground">
              Your account will be added automatically.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {users.length > 0 && (
          <div className="space-y-3">
            {users.map((_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: dynamic form array fields use index as stable key
              <div key={`user-${index}`} className="flex items-end gap-4">
                <FormField
                  control={form.control}
                  name={`additionalUsers.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Username {index + 1}</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUser(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {users.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <UserPlus className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-medium">No additional users</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Click &quot;Add User&quot; to grant access to other users.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
