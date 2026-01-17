
import React from 'react';
import TemplateBuilderComponent from '../components/TemplateBuilder';
import { CustomTemplate, Language } from '../types';

interface TemplateBuilderPageProps {
  lang: Language;
  initialTemplate?: CustomTemplate;
  onSave: (template: CustomTemplate) => void;
  onCancel: () => void;
}

const TemplateBuilder: React.FC<TemplateBuilderPageProps> = (props) => {
  return <TemplateBuilderComponent {...props} />;
};

export default TemplateBuilder;
