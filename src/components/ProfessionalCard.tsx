import { firstNameOf, type Professional } from "@/config/professionals";
import { SectionLabel } from "./common";

export function ProfessionalCard({ professional }: { professional: Professional }) {
  return (
    <div className="single-panel fade-up">
      <SectionLabel>Fictional professional</SectionLabel>
      <div className="person-heading">
        <span className="person-monogram">{professional.name[0]}</span>
        <div>
          <h2>{firstNameOf(professional.name)}</h2>
          <p>{professional.role}</p>
        </div>
      </div>
      <dl className="profile-list">
        <div>
          <dt>Career path</dt>
          <dd>{professional.careerPath}</dd>
        </div>
        <div>
          <dt>What they do</dt>
          <dd>{professional.typicalWork}</dd>
        </div>
      </dl>
      <div className="direction-line">
        <span>Things you could ask about</span>
        <ul>
          {professional.askAbout.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
