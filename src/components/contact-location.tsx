import { Phone, Globe, MapPin, Navigation, QrCode } from "lucide-react";
import type { Yeshiva } from "@/lib/yeshivot-store";
import { Button } from "@/components/ui/button";

function qr(data: string, size = 160) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=4&data=${encodeURIComponent(data)}`;
}

function buildMapsUrl(y: Yeshiva): string | null {
  if (y.mapsUrl) return y.mapsUrl;
  const q = [y.address, y.city].filter(Boolean).join(", ").trim();
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function buildEmbedUrl(y: Yeshiva): string | null {
  const q = [y.address, y.city].filter(Boolean).join(", ").trim() || y.name;
  if (!q) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&hl=he&z=15&output=embed`;
}

function QrCard({ label, data }: { label: string; data: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background p-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:gap-2 sm:p-3">
      <div className="rounded-lg bg-white p-1.5 ring-1 ring-border sm:p-2">
        <img
          src={qr(data, 200)}
          alt={`QR ${label}`}
          loading="lazy"
          className="aspect-square w-full max-w-[120px]"
        />
      </div>
      <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
        <QrCode className="h-3 w-3" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function ContactLocation({ y }: { y: Yeshiva }) {
  const mapsUrl = buildMapsUrl(y);
  const embedUrl = buildEmbedUrl(y);
  const hasAnything = !!(y.phone || y.website || y.address || mapsUrl);

  if (!hasAnything) return null;

  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <MapPin className="h-5 w-5 text-primary" /> יצירת קשר ומיקום
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          כל פרטי הקשר, ניווט מהיר וקודי QR לשיתוף נוח.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-muted/20 shadow-sm">
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Contact details */}
          <div className="space-y-4 p-6">
            {y.phone && (
              <a
                href={`tel:${y.phone}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md"
              >
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">טלפון</div>
                  <div className="truncate font-semibold text-foreground" dir="ltr">{y.phone}</div>
                </div>
              </a>
            )}

            {y.website && (
              <a
                href={y.website}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md"
              >
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">אתר רשמי</div>
                  <div className="truncate font-semibold text-foreground">{y.website.replace(/^https?:\/\//, "")}</div>
                </div>
              </a>
            )}

            {(y.address || y.city) && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-4">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">כתובת</div>
                  <div className="font-semibold text-foreground">
                    {y.address ? `${y.address}${y.city ? `, ${y.city}` : ""}` : y.city}
                  </div>
                </div>
              </div>
            )}

            {/* QR codes */}
            {(y.website || y.phone || mapsUrl) && (
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <QrCode className="h-4 w-4 text-primary" /> סריקה מהירה
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {y.website && <QrCard label="אתר" data={y.website} />}
                  {y.phone && <QrCard label="טלפון" data={`tel:${y.phone}`} />}
                  {mapsUrl && <QrCard label="מפה" data={mapsUrl} />}
                </div>
              </div>
            )}
          </div>

          {/* Map preview */}
          <div className="relative min-h-[280px] bg-muted lg:min-h-full">
            {embedUrl ? (
              <a
                href={mapsUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                aria-label="פתיחת מיקום ב-Google Maps"
                className="group relative block h-full w-full"
              >
                <iframe
                  src={embedUrl}
                  title="מפה"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="pointer-events-none h-full min-h-[280px] w-full border-0"
                />
                {/* Click-overlay */}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-black/10 to-transparent p-4 transition-opacity group-hover:from-black/70">
                  <div className="flex w-full flex-col gap-3">
                    {(y.address || y.city) && (
                      <div className="rounded-lg bg-white/95 px-3 py-2 text-sm font-medium text-foreground shadow-md backdrop-blur-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{y.address ? `${y.address}${y.city ? `, ${y.city}` : ""}` : y.city}</span>
                        </div>
                      </div>
                    )}
                    <Button
                      size="lg"
                      className="w-full shadow-lg"
                      asChild
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <Navigation className="h-5 w-5" />
                        נווט אל הישיבה
                      </span>
                    </Button>
                  </div>
                </div>
              </a>
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
                לא הוזנה כתובת או קישור מפה לישיבה זו.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
