"use client";

import Image from "next/image";
import logo from "@/assets/logo-rava-tech.png";
import logoDistribuidora from "@/assets/logo-rava.png";
import logoVinicius from "@/assets/logo-vinicius.png";
import { CalendarComponent } from "@/components/CalendarComponent";
import { FormComponent } from "@/components/FormComponent";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex justify-start items-center h-16 border-b-2 border-gray-300">
        <Link href="https://www.ravatech.com.br" target="_blank">
          <Image className="w-32" src={logo} alt="Logo Ravatech" />
        </Link>
        <Image className="w-32" src={logoDistribuidora} alt="Logo Distribuidora Rava" />
        <Link href="https://www.linkedin.com/in/viniciuscanavieira" target="_blank">
          <Image className="w-32" src={logoVinicius} alt="Logo Vinicius" />
        </Link>
      </div>
      <CalendarComponent />
      <FormComponent />
    </>
  );
}
