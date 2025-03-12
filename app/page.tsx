import { ArrowRight, Brain, Check, FileUp, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">

            <div className="text-center">
              <p className="text-blue-400 font-semibold text-lg mb-4">Introducing IntelliPDF</p>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Transform Your PDFs into
                <span className="text-blue-400"> Interactive Conversations</span>
              </h1>

              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">Upload your documents and engage with an AI-powered chatbot that understands, summarizes, and answers all your questions instantly.</p>

              <Link
                href={"/dashboard"}
                >
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all flex items-center gap-2 mx-auto cursor-pointer">
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">

                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                      <div className="bg-blue-500/50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
                          <FileUp className="w-6 h-6 text-blue-400" />
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-2">Easy Upload</h3>
                      <p className="text-slate-400">Simply drag and drop your PDF documents to get started. Support for pdf file format only.</p>
                  </div>

                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                      <div className="bg-blue-500/50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
                          <MessageSquare className="w-6 h-6 text-blue-400" />
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-2">Interactive Chat</h3>
                      <p className="text-slate-400">Engage in natural conversations about your documents with our AI-powered chatbot.</p>
                  </div>

                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                      <div className="bg-blue-500/50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
                          <Brain className="w-6 h-6 text-blue-400" />
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-2">Smart Analysis</h3>
                      <p className="text-slate-400">Get instant summaries, insights, and answers to your specific questions.</p>
                  </div>

            </div>
        </div>

        {/* Demo Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Experience IntelliPDF in Action</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">See how our intelligent platform transforms the way you interact with your documents.</p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700">
              <Image
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=2070&q=80"
                width={1920}
                height={500}
                alt="IntelliPDF Demo"
                className="w-full h-[500px] object-cover object-center"
              />
          </div>

        </div>

        {/* Benefits Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-center text-white text-3xl font-bold mb-12">Why Choose IntelliPDF?</h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-8">
            {
              [
                "Instant answers to your document-related questions",
                "Smart summarization of long documents",
                "Secure document handling and processing",
                "24/7 availability for your queries",
                "Support for multiple languages",
                "Export conversations and insights"
              ].map((item, index) => (
                <div key={index} className="flex item-center gap-4 bg-slate-800/30 p-4 rounded-lg">
                    <Check className="w-5 h-5 text-blue-400 shrink-0" />
                    <p className="text-slate-300">{item}</p>
                </div>
              ))
            }
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Documents?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
          Join thousands of users who are already experiencing the future of document interaction with IntelliPDF.
          </p>

          <Link
            href={"/dashboard"}
            >
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all flex items-center gap-2 mx-auto cursor-pointer">
              {/* Start Free Trial <ArrowRight className="w-5 h-5" /> */}
              Start Chatting with PDF <ArrowRight className="w-5 h-5" />
            </button>   
          </Link>

        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-slate-500">© {new Date().getFullYear()} IntelliPDF. All rights reserved.</p>
          </div>
        </footer>

      </div>
  );
}
