import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { FileText, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={"/"} className="flex items-center">
            <Image
              src={"/logo.svg"}
              width={28}
              height={28}
              alt="logo"
            />
            <span className="ml-2 text-xl font-bold text-slate-800">
              IntelliPDF
            </span>
          </Link>

          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href={"/dashboard"}
              className="text-slate-600 hover:text-slate-800 px-2 sm:px-3 py-2 rounded-lg flex items-center"
            >
              <FileText className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">My Documents</span>
            </Link>

            <Link
              href={"/dashboard/upload"}
              className="bg-blue-600 text-white px-2 sm:px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Upload</span>
            </Link>

            <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center">
              <SignedOut>
                <SignInButton />
              </SignedOut>

              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
