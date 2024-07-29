import { MouseEvent, ReactNode, useMemo } from "react";
import { motion, Variant, Variants } from "framer-motion";
import properties from "../../styles/properties";

const generateRows = function <T>(elements: T[], elementsPerRow: number) {
  const rows: T[][] = [];
  let tempRow: T[] = [];
  for (let i = 1; i <= elements.length; i++) {
    tempRow.push(elements[i - 1]);
    if (i % elementsPerRow === 0) {
      rows.push(tempRow);
      tempRow = [];
    }
  }
  return rows;
};

export type tableOnCellClickFn<elementType> = (
  e: MouseEvent<HTMLTableCellElement>
) => (element: elementType, index: number) => void;

export type tableCellIsDisabledFn<elementType> = (
  element: elementType,
  index: number
) => boolean;

export default function Table<T>({
  elements,
  children,
  getIndex,
  isActive,
  elementsPerRow,
  onCellClick,
  isDisabled,
  additionalTailwindClasses,
  additionalTableBodyTailwindClasses,
  activeTableCellRef,
}: {
  elements: T[];
  children: (element: T) => ReactNode;
  getIndex: (element: T) => string;
  isActive: (element: T, elementsArrIndex: number) => boolean;
  elementsPerRow: number;
  onCellClick: tableOnCellClickFn<T>;
  isDisabled?: tableCellIsDisabledFn<T>;
  additionalTailwindClasses?: string;
  additionalTableBodyTailwindClasses?: string;
  activeTableCellRef?: React.RefObject<HTMLTableCellElement>;
}) {
  const rows = useMemo(
    () => generateRows(elements, elementsPerRow),
    [elements, elementsPerRow]
  );

  const elementCellActiveVariant: Variant = {
    opacity: 1,
    backgroundColor: properties.highlightRed,
  };
  const elementCellVariants: Variants = {
    initial: {
      opacity: 0,
      backgroundColor: properties.bodyBg,
    },
    default: {
      opacity: 0.7,
    },
    disabled: {
      opacity: 0.5,
    },
    active: elementCellActiveVariant,
    hover: elementCellActiveVariant,
  };

  return (
    <table
      className={`w-full border-collapse ${
        additionalTailwindClasses ? additionalTailwindClasses : ""
      }`}
    >
      <tbody className={additionalTableBodyTailwindClasses}>
        {rows.map((row, rowIndex) => (
          <tr
            key={row.map((element) => getIndex(element)).join("-")}
            className="w-full text-center"
          >
            {row.map((element, elementIndex) => {
              const curElementArrIndex =
                rowIndex * elementsPerRow + elementIndex;
              const active = isActive(element, curElementArrIndex);
              const disabled = isDisabled
                ? isDisabled(element, curElementArrIndex)
                : false;
              return (
                <motion.td
                  key={getIndex(element)}
                  className={`w-full py-3 px-6 ${
                    !active && !disabled ? "cursor-pointer" : ""
                  }`}
                  variants={elementCellVariants}
                  initial="initial"
                  animate={`${
                    active ? "active" : disabled ? "disabled" : "default"
                  }`}
                  whileHover={`${!active && !disabled ? "hover" : undefined}`}
                  onClick={
                    !active && !disabled
                      ? (e) => onCellClick(e)(element, curElementArrIndex)
                      : undefined
                  }
                  ref={
                    active && activeTableCellRef
                      ? activeTableCellRef
                      : undefined
                  }
                >
                  <motion.div
                    variants={{
                      initial: {
                        scale: 1,
                      },
                      hover: {
                        scale: 1.2,
                      },
                    }}
                  >
                    {children(element)}
                  </motion.div>
                </motion.td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
