import { FileText, Search, Upload } from "lucide-react";
import Link from "next/link";
import React from "react";

export const dynamic = "force-dynamic";


const DashboardPage = () => {
    const documents = [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">My Documents</h1>
                <p className="text-slate-600 text-base">Manage and access your uploaded PDFs</p>
            </div>

            <div className="mt-4 md:mt-0 hidden">
                <div className="relative">
                    <input 
                    type="text"
                    placeholder="Search documents..."
                    className="w-full text-slate-600 md:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />

                <Search className="h-5 w-5 absolute left-3 top-2.5 text-slate-400" />
                </div>
            </div>
        </div>

        {/* Document Listing Section */}
        {
            documents.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-xs border border-slate-200">
                    <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-blue-600" />
                    </div>

                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No documents yet</h3>
                    <p className="text-slate-600 mb-8">Start by adding your first PDF document</p>
                    
                    <Link
                    href={"/dashboard/upload"}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-[1.02] shadow-xs"
                    >
                        <Upload className="h-5 w-5 mr-2" />
                        Add a Document
                    </Link>
                </div>
            ) : 
            (
            <><h1>To be implemented</h1></>
            )
        }
        
    </div>
  );
};

export default DashboardPage;
