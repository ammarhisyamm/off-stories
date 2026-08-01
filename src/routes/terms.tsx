import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/public-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: "Terms of Service — offstories" }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <PublicPage>
      <div className="eyebrow mb-3">Legal</div>
      <h1 className="serif text-3xl sm:text-4xl text-foreground text-balance mb-8">
        Terms of Service
      </h1>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-6">
        <section>
          <h2 className="serif text-lg text-foreground mb-2">The service</h2>
          <p>
            offstories is a personal planning tool that helps you organize your wedding preparation.
            It is provided "as is" and "as available", without warranties of any kind.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Your data</h2>
          <p>
            You are responsible for the content you add. Only you and the partner you invite by
            email can see your workspace. Invitations are tied to a specific email address, and you
            can cancel a pending invitation or remove your partner from the Settings page at any
            time.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Acceptable use</h2>
          <p>
            Use the service for lawful purposes only. Do not attempt to access workspaces you were
            not invited to, or otherwise interfere with the service.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, the provider is not liable for any indirect,
            incidental, or consequential damages arising from your use of the service. You are
            encouraged to keep your own copies of important data.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Changes</h2>
          <p>
            These terms may be updated from time to time. Continued use of the service after changes
            are posted means you accept the updated terms.
          </p>
        </section>
        <p className="text-xs">Last updated: August 2026</p>
      </div>
    </PublicPage>
  );
}
