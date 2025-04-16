import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Upload, Key, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
const settingsFormSchema = z.object({
  openWeatherApiKey: z.string().min(1, "API Key wird benötigt"),
  csvFile: z.any().optional()
});
const Settings = () => {
  const {
    toast
  } = useToast();
  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      openWeatherApiKey: localStorage.getItem('openWeatherApiKey') || ''
    }
  });
  const onSubmit = (data: z.infer<typeof settingsFormSchema>) => {
    localStorage.setItem('openWeatherApiKey', data.openWeatherApiKey);
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Einstellungen wurden erfolgreich gespeichert."
    });
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const csv = e.target?.result;
        // Here we would process the CSV data
        toast({
          title: "CSV Datei hochgeladen",
          description: "Die CSV Datei wurde erfolgreich hochgeladen."
        });
      };
      reader.readAsText(file);
    }
  };
  return <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>
      
      <div className="grid gap-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="openWeatherApiKey" render={({
            field
          }) => <FormItem>
                  <FormLabel>OpenWeather API Key</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="API Key eingeben" {...field} />
                      <Button type="submit" className="w-24 my-0 px-[68px] mx-0 py-0">
                        <Save className="mr-2" />
                        Speichern
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Der API Key wird für die Wettervorhersage benötigt.
                  </FormDescription>
                  <FormMessage />
                </FormItem>} />
          </form>
        </Form>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">CSV Daten Import</h2>
          <div className="flex items-center gap-4">
            <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-md" />
            <Button variant="outline">
              <Upload className="mr-2" />
              Hochladen
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Laden Sie hier Ihre historischen Besucherdaten als CSV-Datei hoch.
          </p>
        </div>
      </div>
    </div>;
};
export default Settings;