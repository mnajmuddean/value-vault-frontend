/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface Item {
  item_code: number;
  item: string;
  unit: string;
  item_group: string;
  item_category: string;
  [key: string]: any;
}

interface ItemsDataTableProps {
  data: Item[];
}

export function ItemsDataTable({ data }: ItemsDataTableProps) {
  // Build a set to track duplicate keys
  const seenKeys = new Set();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, idx) => {
          // Use item_code if present and unique, otherwise fallback to index
          let key: string;
          if (
            item.item_code === undefined ||
            item.item_code === null ||
            seenKeys.has(item.item_code)
          ) {
            key = `row-${idx}`;
          } else {
            key = String(item.item_code);
            seenKeys.add(item.item_code);
          }
          return (
            <TableRow key={key}>
              <TableCell>{item.item}</TableCell>
              <TableCell>{item.item_code}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{item.item_group}</TableCell>
              <TableCell>{item.item_category}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
