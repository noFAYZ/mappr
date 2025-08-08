import { BaseExtension } from "./base";
import { ZerionExtension } from "./crypto/zerion";

export class ExtensionRegistry {
  private static extensions = new Map<string, typeof BaseExtension>();

  static register(slug: string, extension: typeof BaseExtension) {
    this.extensions.set(slug, extension);
  }

  static get(slug: string): typeof BaseExtension | undefined {
    return this.extensions.get(slug);
  }

  static list(): Array<{ slug: string; extension: typeof BaseExtension }> {
    return Array.from(this.extensions.entries()).map(([slug, extension]) => ({
      slug,
      extension,
    }));
  }

  static createInstance(slug: string): BaseExtension | null {
    const ExtensionClass = this.get(slug);

    if (!ExtensionClass) {
      return null;
    }

    return new ExtensionClass();
  }
}

// Register extensions
ExtensionRegistry.register("zerion", ZerionExtension);
