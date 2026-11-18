import { useCallback, useState } from "react";

const RAISED_Z = 1000;

// Last-touched elements stack above the rest, in the order they were touched.
export function useRaise<Id>() {
  const [order, setOrder] = useState<Id[]>([]);
  const raise = useCallback((id: Id) => setOrder((o) => [...o.filter((x) => x !== id), id]), []);
  const raisedZ = (id: Id) => {
    const i = order.indexOf(id);
    return i < 0 ? undefined : RAISED_Z + i;
  };
  return { raise, raisedZ };
}
