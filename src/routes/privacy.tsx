import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/public-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Policy — Wedding Preparation" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <PublicPage>
      <div className="eyebrow mb-3">Legal</div>
      <h1 className="serif text-3xl sm:text-4xl text-foreground text-balance mb-8">
        Privacy Policy
      </h1>
      <div className="prose text-sm text-muted-foreground leading-relaxed space-y-6">
        <section>
          <h2 className="serif text-lg text-foreground mb-2">What we collect</h2>
          <p>
            When you sign in with Google, we receive your name, email address, and profile picture
            from your Google account. We use this only to identify you within your workspace and
            display it to your collaborators.
          </p>
          <p>
            Data you enter into the app — your event details, checklist, budget, vendors, guests,
            milestones, notes, and documents — is stored and belongs to your wedding workspace.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Google Calendar access</h2>
          <p>
            When you choose to sync your timeline, we request access to your Google Calendar so we
            can create and update all-day events for your milestones. Calendar access is used only
            for this purpose and never for anything else. You can revoke calendar access at any time
            from your Google Account settings, and reset the sync log from the app's Settings page.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Where data lives</h2>
          <p>
            Your data is stored securely with our hosting provider (Supabase). We do not sell your
            data, and we do not use it for advertising.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Sharing</h2>
          <p>
            Your workspace is only visible to people you explicitly invite via a shareable link.
            Collaborators can view and edit the workspace data according to the role you assign
            them.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Deleting your data</h2>
          <p>
            To delete your account and workspace data, contact us and we'll remove everything
            associated with your account. You can also revoke Google sign-in and calendar access
            directly from your Google Account at any time.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Contact</h2>
          <p>
            For any privacy questions or deletion requests, reach out via the email used to sign in
            — we'll respond as soon as possible.
          </p>
        </section>
        <p className="text-xs">Last updated: August 2026</p>
      </div>
    </PublicPage>
  );
}
