import { Theme } from "@radix-ui/themes";
import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { CartProvider } from "../src/providers/CartProvider";
import ReduxProvider from "../src/providers/ReduxProvider";

const AllProviders = ({ children }: PropsWithChildren) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider>
        <CartProvider>
          <Theme>{children}</Theme>
        </CartProvider>
      </ReduxProvider>
    </QueryClientProvider>
  );
};

export default AllProviders;
