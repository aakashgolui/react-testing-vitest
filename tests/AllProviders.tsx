import { Theme } from "@radix-ui/themes";
import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const AllProviders = ({ children }: PropsWithChildren) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <Theme>{children}</Theme>
    </QueryClientProvider>
  );
};

export default AllProviders;
