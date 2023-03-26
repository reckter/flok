"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Menu from "@/components/menu";
import Mosaic from "@/components/mosaic";
import ConfigureDialog from "../../components/configure-dialog";
import { allTargets } from "@flok/core";
import { useToast } from "@/hooks/use-toast";
import { store } from "@/lib/utils";
import Editor from "@/components/editor";
import Pane from "@/components/pane";
import type { Session } from "@flok/codemirror";

interface Pane {
  target: string;
  content: string;
}

const defaultTarget = allTargets[0] || "default";

export default function SessionPage() {
  const pathname = usePathname();
  const sessionName = pathname.slice(1);

  const { toast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [panes, setPanes] = useState<Pane[]>([
    { target: defaultTarget, content: "" },
  ]);

  useEffect(() => {
    if (!sessionName) return;

    import("@flok/codemirror").then((cm) => {
      const newSession = new cm.Session(sessionName);
      setSession(newSession);
    });
  }, [sessionName]);

  useEffect(() => {
    const key = `session:${sessionName}`;
    const settings = store.get(key);
    if (!settings) store.set(key, {});
    console.log("settings for", sessionName, settings);
  }, [sessionName]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     toast({
  //       description: "Connected to Flok server",
  //     });
  //   }, 500);
  // }, [toast]);

  const handleViewLayoutAdd = () => {
    setPanes((prevPanes) => [
      ...prevPanes,
      { target: defaultTarget, content: "" },
    ]);
  };

  const handleViewLayoutRemove = () => {
    setPanes((prevPanes) => prevPanes.slice(0, -1));
  };

  const handleSessionConfigure = () => {
    setConfigureDialogOpen(true);
  };

  return (
    <>
      <Menu
        onViewLayoutAdd={handleViewLayoutAdd}
        onViewLayoutRemove={handleViewLayoutRemove}
        onSessionConfigure={handleSessionConfigure}
      />
      <ConfigureDialog
        open={configureDialogOpen}
        onOpenChange={(isOpen) => setConfigureDialogOpen(isOpen)}
      />
      <Mosaic
        items={panes.map((pane, i) => (
          <Pane key={i}>
            <Editor
              key={i}
              value={pane.content}
              autoFocus={i === 0}
              session={session}
              target={pane.target}
              id={`pane-${i}`}
              className="flex-grow"
            />
          </Pane>
        ))}
      />
    </>
  );
}
