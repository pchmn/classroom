import { useCallback, useEffect, useRef, useState } from "react";

// Ids that stay in the set for `duration` ms, e.g. to keep a CSS transition on while it plays.
export function useTransientSet<Id>(duration: number) {
  const [ids, setIds] = useState<ReadonlySet<Id>>(new Set());
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const add = useCallback(
    (added: Id[]) => {
      setIds((s) => new Set([...s, ...added]));
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        setIds((s) => new Set([...s].filter((id) => !added.includes(id))));
      }, duration);
      timers.current.add(timer);
    },
    [duration],
  );

  return [ids, add] as const;
}
