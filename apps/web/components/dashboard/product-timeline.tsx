import { CircleCheck, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductTraceEvent } from "@/lib/dashboard";

export function ProductTimeline({ events }: { events: ProductTraceEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recorrido verificable</CardTitle>
      </CardHeader>
      <CardContent className="timeline">
        {events.map((event) => (
          <div key={event.id} className="timeline__item">
            <div className={`timeline__status timeline__status--${event.status}`}>
              {event.status === "verified" ? <CircleCheck size={16} /> : <Clock3 size={16} />}
            </div>
            <div className="timeline__body">
              <div className="timeline__header">
                <div>
                  <p>{event.stage}</p>
                  <strong>{event.actor}</strong>
                </div>
                <Badge variant={event.status === "verified" ? "green" : "gold"}>
                  {event.status === "verified" ? "Verified" : "Pending"}
                </Badge>
              </div>
              <span>{event.timestamp}</span>
              <span>{event.location}</span>
              <p>{event.detail}</p>
              <code>{event.stellarRef}</code>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

