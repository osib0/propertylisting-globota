"use client";

import { CheckCircle2, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Head from "next/head";
import { redirect } from "next/navigation";

export default function ThankYouPage() {


  function dashboardHandler(){
    window.location.reload()
    redirect('/dashboard/basic-info')

  }
  return (
    <>
      <Head>
        <title>Thank You | Property Submitted</title>
        <meta
          name="description"
          content="Your property has been submitted successfully and is under review by our Partner Globota verification team."
        />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center">
        {/* Main Card */}
        <div className="bg-white rounded-xl p-10 w-full max-w-lg text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Success Icon */}
            <div className="relative">
              <CheckCircle2 className="w-20 h-20 text-blue-600 mb-2 drop-shadow-md" />
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-100 h-1 w-16 rounded-full" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Property Submitted Successfully!
            </h1>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed max-w-md text-sm sm:text-base">
              Thank you for sharing your property details with{" "}
              <strong>Partner GlobOTA</strong>. Our verification team is now
              reviewing your submission. You’ll receive an email update once
              your listing is approved and live on{" "}
              <strong>royalRajasthan.travel</strong>.
            </p>

            {/* Status Information */}
            <div className="flex flex-col items-center gap-2 text-sm text-gray-500 mt-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>
                  Confirmation email sent to your registered email address
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Average approval time: 24–48 hours</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-full w-full sm:w-auto text-sm sm:text-base" onClick={dashboardHandler}>
                  Go to Dashboard
                </Button>

              <Link href="/partner/help" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-5 rounded-full w-full sm:w-auto text-sm sm:text-base"
                >
                  Need Help?
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <footer className="mt-10 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Partner GlobOTA for royalRajasthan.travel.
            Your submission is being processed securely.
          </p>
        </footer>
      </div>
    </>
  );
}
