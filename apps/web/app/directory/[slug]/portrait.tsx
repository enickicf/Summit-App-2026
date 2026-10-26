"use client";

import { useState } from "react";
import { personInitials, portraitBackgroundStyle, portraitImageStyle } from "../../../lib/person-portraits";
import { getSiteImageMetadata, SiteImage } from "../../../components/site-image";

export function ProfilePortrait({ name, image }: { name: string; image?: string | undefined }) {
  const [failedImage, setFailedImage] = useState<string>();
  return <div className="profilePortrait" data-person={name} aria-hidden="true" style={portraitBackgroundStyle(image)}>
    {image && failedImage !== image
      ? getSiteImageMetadata(image)
        ? <SiteImage src={image} alt="" sizes="(max-width: 380px) 90vw, (max-width: 700px) 300px, 340px" loading="eager" style={portraitImageStyle(name, image)} onError={() => setFailedImage(image)} />
        : <img src={image} alt="" style={portraitImageStyle(name, image)} width={500} height={500} onError={() => setFailedImage(image)} />
      : <span>{personInitials(name)}</span>}
  </div>;
}
