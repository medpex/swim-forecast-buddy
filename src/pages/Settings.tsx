import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getSettings, updateSettings } from "@/services/settingsService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CSVImport from '@/components/CSVImport';

const settingsFormSchema = z.object({
  postalCode: z.string().regex(/^\d{5}$/, "Bitte geben Sie eine gültige 5-stellige Postleitzahl ein"),
  csvFile: z.any().optional()
});

const Settings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Einstellungen wurden erfolgreich gespeichert."
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  });

  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      postalCode: '',
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        postalCode: settings.postal_code || '',
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: z.infer<typeof settingsFormSchema>) => {
    await updateSettingsMutation.mutateAsync({
      postal_code: data.postalCode,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const csv = e.target?.result;
        toast({
          title: "CSV Datei hochgeladen",
          description: "Die CSV Datei wurde erfolgreich hochgeladen."
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>
      
      <div className="grid gap-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postleitzahl des Schwimmbads</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="z.B. 12345"
                        {...field}
                        className="flex-grow"
                        maxLength={5}
                      />
                      <Button type="submit" className="w-24 my-0 py-0 px-[68px]">
                        <MapPin className="mr-2" />
                        Speichern
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Die Postleitzahl wird zur Bestimmung des Wetters verwendet.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div className="grid gap-6 mt-8">
          <h2 className="text-xl font-semibold">Daten Import</h2>
          <CSVImport />
        </div>
      </div>
    </div>
  );
};

export default Settings;
