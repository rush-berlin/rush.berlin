"use strict";

const renderer = ({ container, goBackLink, episodeHtml, episodes }) => {
  const placeholderHTML = container.innerHTML;

  return () => {
    let listHTML = "";
    let usePlaceholder = true;
    goBackLink.hidden = true;

    const renderItem = ({ title, description, src, permalink }) => {
      usePlaceholder = false;

      listHTML += episodeHtml({
        title,
        description,
        src,
        permalink,
      });
    };

    if (window.location.hash.length > 1) {
      const hash = window.location.hash.slice(1);
      const episode = episodes.find((episode) => episode.episode === hash);
      renderItem(episode);

      goBackLink.hidden = false;
    } else {
      episodes.forEach(renderItem);
    }

    if (usePlaceholder) {
      container.innerHTML = placeholderHTML;
    } else {
      container.innerHTML = listHTML;
    }
  };
};
