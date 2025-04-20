// UI library shims
declare module '@radix-ui/react-alert-dialog' {
  export const Root: any;
  export const Trigger: any;
  export const Portal: any;
  export const Overlay: any;
  export const Content: any;
  export const Title: any;
  export const Description: any;
  export const Action: any;
  export const Cancel: any;
}

declare module '@radix-ui/react-dialog' {
  export const Root: any;
  export const Trigger: any;
  export const Portal: any;
  export const Overlay: any;
  export const Content: any;
  export const Title: any;
  export const Description: any;
  export const Close: any;
}

declare module '@radix-ui/react-sheet' {
  export const Root: any;
  export const Trigger: any;
  export const Portal: any;
  export const Overlay: any;
  export const Content: any;
  export const Title: any;
  export const Description: any;
  export const Close: any;
}

declare module '@radix-ui/react-toast' {
  export const Provider: any;
  export const Viewport: any;
  export const Root: any;
  export const Title: any;
  export const Description: any;
  export const Action: any;
  export const Close: any;
}

declare module '@radix-ui/react-tabs' {
  export const Root: any;
  export const List: any;
  export const Trigger: any;
  export const Content: any;
}

declare module '@radix-ui/react-slider' {
  export const Root: any;
  export const Track: any;
  export const Range: any;
  export const Thumb: any;
}

declare module '@radix-ui/react-checkbox' {
  export const Root: any;
  export const Indicator: any;
}

declare module 'react-day-picker' {
  export const DayPicker: any;
  export const useNavigation: any;
}

declare module 'embla-carousel-react' {
  export const useEmblaCarousel: () => [React.RefObject<HTMLElement>, any];
  export type UseEmblaCarouselType = [React.RefObject<HTMLElement>, any];
}

declare module 'recharts' {
  export const ResponsiveContainer: any;
  export const AreaChart: any;
  export const Area: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export type TooltipProps = any;
  export const Legend: any;
  export interface NameType {
    name: string;
  }
  export type ValueType = any;
  export type Props = any;
}

declare module 'cmdk' {
  export const Command: any;
  export type CommandProps = any;
}

declare module 'vaul' {
  export const Drawer: any;
}

declare module 'react-resizable-panels' {
  export const PanelGroup: any;
  export const Panel: any;
  export const PanelResizeHandle: any;
  export type ImperativePanelHandle = any;
  export type PanelGroupProps = any;
  export type PanelProps = any;
  export type PanelResizeHandleProps = any;
}

declare module 'sonner' {
  export const Toaster: any;
  export const toast: any;
}

declare module 'react-hook-form' {
  export const useForm: any;
  export const useFormContext: any;
  export const useController: any;
  export const useFormState: any;
  export const FormProvider: any;
  export const Controller: any;
  export type ControllerProps = any;
  export type UseFormReturn = any;
  export type FieldPath<T> = any;
  export type FieldValues = any;
  export type Control = any;
  export type Path<T> = any;
}

declare module '@hookform/resolvers/zod' {
  export const zodResolver: any;
}

declare module '@radix-ui/react-label' {
  export const Root: any;
}

declare module '@radix-ui/react-select' {
  export const Root: any;
  export const Group: any;
  export const Value: any;
  export const Trigger: any;
  export const Content: any;
  export const Viewport: any;
  export const Item: any;
  export const ItemText: any;
  export const ItemIndicator: any;
  export const ScrollUpButton: any;
  export const ScrollDownButton: any;
  export const Icon: any;
  export const Label: any;
  export const Separator: any;
}

declare module '@radix-ui/react-slot' {
  export const Slot: any;
}
