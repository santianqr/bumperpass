"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Page() {
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");

  useEffect(() => {
    const loadedName = localStorage.getItem("name");
    if (loadedName) {
      setSavedName(loadedName);
    }
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleSave = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Esto evita que el formulario se envíe y recargue la página
    localStorage.setItem('name', name);
    setSavedName(name);
  };

  return <div>
    <form>
        <Input onChange={handleChange} value={name} />
        <Button onClick={handleSave}>Save</Button>
        <p>Saved name: {savedName}</p> {/* Cambiado a mostrar `savedName` */}
    </form>
  </div>;
}
