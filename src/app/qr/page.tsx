"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

export default function QRPage() {
    const [url, setUrl] = useState("");

    useEffect(() => {
        // Run on client to get the current actual window origin
        setUrl(window.location.origin);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (!url) return null;

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute top-6 left-6 non-printable">
                <Link href="/">
                    <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-muted-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
            </div>

            <div className="max-w-sm w-full bg-card border border-border p-8 rounded-3xl shadow-sm printable-area">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex flex-col items-center justify-center text-primary mx-auto mb-6 shadow-inner">
                    <span className="text-xl font-bold uppercase tracking-wider leading-none mb-0.5">M</span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Manamki Fridge Link</h1>
                <p className="text-muted-foreground text-sm font-medium mb-8">
                    Scan to instantly access your shared recipes and pantry status.
                </p>

                <div className="bg-white p-6 rounded-2xl mx-auto inline-block border-2 border-dashed border-border mb-8 shadow-sm">
                    <QRCode
                        value={url}
                        size={200}
                        bgColor="#FFFFFF"
                        fgColor="#1E1E1E"
                        level="H"
                    />
                </div>

                <div className="flex gap-3 non-printable">
                    <Button
                        onClick={handlePrint}
                        className="flex-1 rounded-2xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold shadow-sm py-6"
                    >
                        <Printer className="w-5 h-5 mr-2" />
                        Print directly
                    </Button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .non-printable { display: none !important; }
                    body { background: white !important; }
                    .printable-area { border: none !important; box-shadow: none !important; }
                }
            `}} />
        </main>
    );
}
