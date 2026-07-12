import * as React from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
  X,
  EyeOff,
  ListFilter,
} from 'lucide-react-native';

export type { ColumnDef };

// ──────────────────────────────────────────────
// DataTableColumnHeader
// ──────────────────────────────────────────────

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: {
  column: any;
  title: string;
}) {
  if (!column.getCanSort()) {
    return <Text>{title}</Text>;
  }

  const isSorted = column.getIsSorted();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable className="flex-row items-center gap-1 active:opacity-70">
          <Text>{title}</Text>
          {isSorted === 'asc' ? (
            <Icon as={ArrowUp} size={12} className="text-primary" />
          ) : isSorted === 'desc' ? (
            <Icon as={ArrowDown} size={12} className="text-primary" />
          ) : (
            <Icon as={ArrowUpDown} size={12} className="text-muted-foreground" />
          )}
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onPress={() => column.toggleSorting(false)}>
          <Icon as={ArrowUp} size={14} className="text-muted-foreground" />
          <Text>Asc</Text>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={() => column.toggleSorting(true)}>
          <Icon as={ArrowDown} size={14} className="text-muted-foreground" />
          <Text>Desc</Text>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onPress={() => column.toggleVisibility(false)}>
          <Icon as={EyeOff} size={14} className="text-muted-foreground" />
          <Text>Hide</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ──────────────────────────────────────────────
// DataTablePagination
// ──────────────────────────────────────────────

function DataTablePagination<TData>({ table }: { table: any }) {
  return (
    <View className="flex-row items-center justify-between px-2 py-2">
      <Text className="text-muted-foreground flex-1 text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </Text>
      <View className="flex-row items-center gap-3 sm:gap-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-medium">Rows</Text>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(v: any) => table.setPageSize(Number(v.value))}>
            <SelectTrigger size="sm" className="h-8 w-[70px]">
              <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`} label={`${size}`} />
              ))}
            </SelectContent>
          </Select>
        </View>
        <Text className="text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </Text>
        <View className="flex-row gap-1">
          <Button
            variant="outline"
            size="sm"
            onPress={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}>
            <Icon as={ChevronsLeft} size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            <Icon as={ChevronLeft} size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            <Icon as={ChevronRight} size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}>
            <Icon as={ChevronsRight} size={14} />
          </Button>
        </View>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// DataTableFacetedFilter
// ──────────────────────────────────────────────

interface FacetedFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: {
  column?: any;
  title?: string;
  options: FacetedFilterOption[];
}) {
  if (!column) return null;

  const facets = column.getFacetedUniqueValues();
  const selectedValues = new Set(column.getFilterValue() as string[]);

  const onSelect = (value: string) => {
    if (selectedValues.has(value)) {
      selectedValues.delete(value);
    } else {
      selectedValues.add(value);
    }
    const filterValues = Array.from(selectedValues);
    column.setFilterValue(filterValues.length ? filterValues : undefined);
  };

  const onClear = () => column.setFilterValue(undefined);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon as={ListFilter} size={14} />
          <Text>{title}</Text>
          {selectedValues.size > 0 && (
            <>
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                <Text className="text-xs">{selectedValues.size}</Text>
              </Badge>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>
          <Text>{title}</Text>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const isSelected = selectedValues.has(option.value);
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={() => onSelect(option.value)}>
              {option.icon && <Icon as={option.icon} size={14} className="text-muted-foreground" />}
              <Text>{option.label}</Text>
              {facets?.get(option.value) && (
                <Text className="text-muted-foreground ml-auto text-xs">
                  {facets.get(option.value)}
                </Text>
              )}
            </DropdownMenuCheckboxItem>
          );
        })}
        {selectedValues.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onPress={onClear}>
              <Text>Clear filters</Text>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ──────────────────────────────────────────────
// DataTableViewOptions
// ──────────────────────────────────────────────

function DataTableViewOptions<TData>({ table }: { table: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon as={Settings2} size={14} />
          <Text>View</Text>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <Text>Toggle columns</Text>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column: any) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide(),
          )
          .map((column: any) => {
            const title =
              typeof column.columnDef.header === 'string'
                ? column.columnDef.header
                : column.id;
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value: boolean) => column.toggleVisibility(!!value)}>
                <Text className="capitalize">{title}</Text>
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ──────────────────────────────────────────────
// DataTableToolbar
// ──────────────────────────────────────────────

interface DataTableToolbarProps<TData> {
  table: any;
  filterColumn?: string;
  filterPlaceholder?: string;
  facetedFilters?: {
    column: string;
    title: string;
    options: FacetedFilterOption[];
  }[];
}

function DataTableToolbar<TData>({
  table,
  filterColumn,
  filterPlaceholder = 'Filter...',
  facetedFilters,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [filterValue, setFilterValue] = React.useState('');

  React.useEffect(() => {
    const col = filterColumn ? table.getColumn(filterColumn) : null;
    if (col) {
      col.setFilterValue(filterValue || undefined);
    }
  }, [filterValue, filterColumn, table]);

  return (
    <View className="flex-row items-center justify-between gap-2">
      <View className="flex-1 flex-row items-center gap-2">
        {filterColumn && (
          <View className="border-border h-8 w-[150px] flex-row items-center rounded-md border bg-background px-3 lg:w-[250px]">
            <TextInput
              className="flex-1 py-1 text-sm text-foreground"
              placeholder={filterPlaceholder}
              placeholderTextColor="#9ca3af"
              value={filterValue}
              onChangeText={setFilterValue}
            />
            {filterValue ? (
              <Pressable onPress={() => setFilterValue('')}>
                <Icon as={X} size={14} className="text-muted-foreground" />
              </Pressable>
            ) : null}
          </View>
        )}
        {facetedFilters?.map((f) => (
          <DataTableFacetedFilter
            key={f.column}
            column={table.getColumn(f.column)}
            title={f.title}
            options={f.options}
          />
        ))}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              table.resetColumnFilters();
              setFilterValue('');
            }}>
            <Text>Reset</Text>
            <Icon as={X} size={14} />
          </Button>
        )}
      </View>
      <DataTableViewOptions table={table} />
    </View>
  );
}

// ──────────────────────────────────────────────
// DataTable (main)
// ──────────────────────────────────────────────

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  sortable?: boolean;
  filterColumn?: string;
  filterPlaceholder?: string;
  facetedFilters?: DataTableToolbarProps<TData>['facetedFilters'];
  enableRowSelection?: boolean;
  toolbar?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 25,
  sortable = true,
  filterColumn,
  filterPlaceholder,
  facetedFilters,
  enableRowSelection = false,
  toolbar = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const allColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectCol: ColumnDef<TData, TValue> = {
      id: 'select',
      header: ({ table }: any) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectCol, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting: sortable ? sorting : undefined,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    onSortingChange: sortable ? setSorting : undefined,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortable ? getSortedRowModel() : undefined,
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableRowSelection,
    initialState: { pagination: { pageSize } },
  });

  return (
    <View className="gap-4">
      {toolbar && (
        <DataTableToolbar
          table={table}
          filterColumn={filterColumn}
          filterPlaceholder={filterPlaceholder}
          facetedFilters={facetedFilters}
        />
      )}
      <View className="overflow-hidden rounded-md border border-border">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="w-full items-center py-6"
                    style={{ minWidth: 200 }}>
                    <Text className="text-muted-foreground text-sm">No results.</Text>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollView>
      </View>
      <DataTablePagination table={table} />
    </View>
  );
}
