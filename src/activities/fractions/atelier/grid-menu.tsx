import { Button, Popover, Stepper, Swatches } from "../../../ui";
import { PALETTE } from "../grids";
import { cellCount, MAX_SIZE, MIN_SIZE, resize, type GridItem } from "./model";

type GridMenuProps = {
  item: GridItem;
  anchor: HTMLElement;
  onChange: (item: GridItem) => void;
  onGlueRight: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function GridMenu({
  item,
  anchor,
  onChange,
  onGlueRight,
  onDelete,
  onClose,
}: GridMenuProps) {
  const isFill = item.kind === "fill";
  return (
    <Popover anchor={anchor} onClose={onClose}>
      <Stepper
        className="justify-between"
        label="Colonnes"
        value={item.cols}
        onChange={(cols) => onChange(resize(item, cols, item.rows))}
        min={MIN_SIZE}
        max={MAX_SIZE}
        decrementLabel="Moins de colonnes"
        incrementLabel="Plus de colonnes"
      />
      <Stepper
        className="justify-between"
        label="Lignes"
        value={item.rows}
        onChange={(rows) => onChange(resize(item, item.cols, rows))}
        min={MIN_SIZE}
        max={MAX_SIZE}
        decrementLabel="Moins de lignes"
        incrementLabel="Plus de lignes"
      />
      {isFill ? (
        <>
          <div className="flex items-center justify-between gap-2.5">
            Couleur
            <Swatches
              colors={PALETTE}
              value={item.color}
              onChange={(color) => onChange({ ...item, color })}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                onChange({ ...item, filled: Array.from({ length: cellCount(item) }, (_, i) => i) })
              }
            >
              Tout remplir
            </Button>
            <Button onClick={() => onChange({ ...item, filled: [] })}>Vider</Button>
          </div>
        </>
      ) : (
        <Button onClick={onGlueRight}>+ Coller une unité à droite</Button>
      )}
      <Button variant="danger" onClick={onDelete}>
        Supprimer la grille
      </Button>
    </Popover>
  );
}
