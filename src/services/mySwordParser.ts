/**
 * MySwordParser - Utility to parse and convert MySword (GBF/HTML) tags to standard HTML.
 */

export class MySwordParser {
  /**
   * Parses Bible verse text containing GBF tags (MySword) or HTML tags (MyBible).
   */
  static parseBibleText(text: string, settings?: any, isNewTestament = false): string {
    if (!text) return "";

    let parsed = text;

    // 1. Basic Formatting (Separate MySword and MyBible to avoid undefined replacements)
    // MySword Style
    parsed = parsed.replace(/<FI>(.*?)<Fi>/gi, '<i>$1</i>');
    parsed = parsed.replace(/<FU>(.*?)<Fu>/gi, '<u>$1</u>');
    // MyBible Style
    parsed = parsed.replace(/<i>(.*?)<\/i>/gi, '<i>$1</i>');
    parsed = parsed.replace(/<u>(.*?)<\/u>/gi, '<u>$1</u>');
    
    // Enhanced Words of Jesus (Separate to avoid undefined)
    if (settings?.textDisplay?.wordsOfJesusRed !== false) {
      parsed = parsed.replace(/<FR>(.*?)<Fr>/gi, '<span class="words-of-jesus">$1</span>');
      parsed = parsed.replace(/<J>(.*?)<\/J>/gi, '<span class="words-of-jesus">$1</span>');
    } else {
      parsed = parsed.replace(/<FR>(.*?)<Fr>/gi, '$1');
      parsed = parsed.replace(/<J>(.*?)<\/J>/gi, '$1');
    }
    parsed = parsed.replace(/<FO>(.*?)<Fo>/gi, '<span class="ot-quote">$1</span>');

    // 2b. Section titles / headings
    const sectionTitlePattern = /<TS(\d*)>([\s\S]*?)<(?:Ts\1|Ts)>/gi;
    if (settings?.textDisplay?.headlines !== false) {
      parsed = parsed.replace(sectionTitlePattern, (_, level, title) => {
        const normalizedLevel = level || '1';
        return `<span class="bible-title bible-title-${normalizedLevel}">${title.trim()}</span>`;
      });
    } else {
      parsed = parsed.replace(sectionTitlePattern, '');
    }

    // 2c. Inline verse markers used by some MySword/MyBible-derived modules
    parsed = parsed.replace(/<v=[^>]+>/gi, '');
    
    // 3. Strong's Numbers (Support MySword <WG1234>/<WH1234> and MyBible <S1234>)
    // By default, hide Strong's unless explicitly enabled
    const showStrongs = settings?.studyTools?.strongsTags === true;
    const linkedStrongs = settings?.studyTools?.strongsLinks === true;

    if (showStrongs) {
        // 3a. MySword Style (Explicit G/H)
        const strongsClass = linkedStrongs ? 'strongs-link' : 'strongs-link strongs-text';
        parsed = parsed.replace(/<WG(\d+)>/gi, `<a href="sG$1" class="${strongsClass}">G$1</a>`);
        parsed = parsed.replace(/<WH(\d+)>/gi, `<a href="sH$1" class="${strongsClass}">H$1</a>`);

        // 3b. MyBible Style (S prefix without letter, determined by context)
        const prefix = isNewTestament ? 'G' : 'H';
        parsed = parsed.replace(/<S(\d+)>/gi, `<a href="s${prefix}$1" class="${strongsClass}">${prefix}$1</a>`);
        parsed = parsed.replace(/<S>(\d+)<\/S>/gi, `<a href="s${prefix}$1" class="${strongsClass}">${prefix}$1</a>`);
    } else {
        // Hide Strong's
        parsed = parsed.replace(/<WG\d+>|<WH\d+>|<S\d+>|<S>.*?<\/S>/gi, '');
    }

    // 4. Morphology
    if (settings?.studyTools?.morphTags) {
      parsed = parsed.replace(/<WT(.*?)>/gi, '<a href="m$1" class="morph-link">$1</a>');
    } else {
      parsed = parsed.replace(/<WT.*?>/gi, '');
    }

    // 5. Translator Notes
    if (settings?.studyTools?.translatorNotes !== false) {
      parsed = parsed.replace(/<RF(?:\s+q=([^>]+))?>(.*?)<Rf>/gi, (_, q, note) => {
        const label = q || "note";
        return `<a href="r${note}" class="translator-note" title="${note}">[${label}]</a>`;
      });
    } else {
      parsed = parsed.replace(/<RF.*?>.*?<Rf>/gi, '');
    }

    // 6. Cross References
    if (settings?.visualResources?.crossRefs) {
      parsed = parsed.replace(/<RX([\d.]+)(?:-[\d.]+)?\s*>/gi, '<a href="b$1" class="cross-ref">🔗</a>');
    } else {
      parsed = parsed.replace(/<RX.*?>/gi, '');
    }

    // 7. Paragraphs and Poetry
    if (settings?.textDisplay?.paragraphMode !== false) {
      parsed = parsed.replace(/<CM>/gi, '<br/><br/>');
    } else {
      parsed = parsed.replace(/<CM>/gi, ' ');
    }
    parsed = parsed.replace(/<PI(\d+)>/gi, '<span class="indent-$1"></span>');
    parsed = parsed.replace(/<PF(\d+)>/gi, '<span class="first-line-indent-$1"></span>');

    // 8. Interlinear tags
    if (settings?.studyTools?.interlinearMode) {
      parsed = parsed.replace(/<Q>/gi, '<span class="interlinear-block">');
      parsed = parsed.replace(/<q>/gi, '</span>');
      parsed = parsed.replace(/<E>(.*?)<e>/gi, '<span class="interlinear-eng">$1</span>');
      parsed = parsed.replace(/<T>(.*?)<t>/gi, '<span class="interlinear-trans">$1</span>');
      parsed = parsed.replace(/<X>(.*?)<x>/gi, '<span class="interlinear-translit">$1</span>');
      parsed = parsed.replace(/<H>(.*?)<h>/gi, '<span class="interlinear-heb">$1</span>');
      parsed = parsed.replace(/<G>(.*?)<g>/gi, '<span class="interlinear-grk">$1</span>');
    } else {
      // Hide interlinear content except maybe the main text if we can determine it
      // For now, let's keep it simple: hide all interlinear if mode is off
      parsed = parsed.replace(/<Q>.*?<q>/gi, '');
      // Fallback for individual tags outside Q
      parsed = parsed.replace(/<(?:E|T|X|H|G)>.*?<(?:e|t|x|h|g)>/gi, '');
    }

    // 9. Clean up any remaining tags
    parsed = parsed.replace(/<[^>]+>/g, (match) => {
      if (/^<\/?(i|u|span|h4|a|br|b|p|div|ul|li|ol|em|strong|blockquote)[^>]*>$/i.test(match)) {
        return match;
      }
      return "";
    });

    return parsed;
  }

  /**
   * Parses non-bible content (Dictionary, Commentary, etc.)
   */
  static parseContent(text: string): string {
    if (!text) return "";

    let parsed = text;

    // MySword links in <a> tags
    // <a href='b43.3.16'> -> Standardized for our app
    // We'll keep the hrefs as they are but ensure they are correctly handled by our link interceptor
    
    // Support for MySword color classes
    const colors = ['red', 'orange', 'brown', 'green-yellow', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'gray'];
    colors.forEach(color => {
      const regex = new RegExp(`class=['"]${color}['"]`, 'gi');
      parsed = parsed.replace(regex, `class="mysword-color-${color}"`);
    });

    return parsed;
  }
}
