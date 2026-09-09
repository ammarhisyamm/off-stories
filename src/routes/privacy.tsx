import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/public-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Policy, offstories" }],
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
            display it to your partner.
          </p>
          <p>
            Data you enter into the app (your event details, checklist, budget, vendors, guests,
            milestones, notes, and documents) is stored and belongs to your wedding workspace.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Email & password accounts</h2>
          <p>
            If you create an account with your email and a password, we store your email address so
            you can sign back in and receive account messages. Passwords are stored securely using
            industry-standard hashing and are never shared.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Where data lives</h2>
          <p>
            Your data is stored securely with our Cloudflare-hosted services. We do not sell your
            data, and we do not use it for advertising.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Product analytics</h2>
          <p>
            We record limited first-party product events, such as an organic visit, a planning CTA,
            signup completion, workspace creation, and partner invitation. These events help us
            understand whether OffStories is useful. They do not include your wedding details, guest
            names, budget values, document contents, or email address.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Sharing</h2>
          <p>
            Your workspace is only visible to you and the one partner you invite by email.
            Invitations are tied to a specific email address, and your partner joins as an editor.
            You can cancel a pending invitation or remove your partner at any time.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Deleting your data</h2>
          <p>
            To delete your account and workspace data, contact us and we'll remove everything
            associated with your account. You can also revoke Google sign-in directly from your
            Google Account at any time.
          </p>
        </section>
        <section>
          <h2 className="serif text-lg text-foreground mb-2">Contact</h2>
          <p>
            For any privacy questions or deletion requests, reach out via the email used to sign in,
            and we'll respond as soon as possible.
          </p>
        </section>
        <p className="text-xs">Last updated: September 2026</p>
      </div>
    </PublicPage>
  );
}
